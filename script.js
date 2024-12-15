let data = [];
let currentPage = 1;
const articlesPerPage = 10;
let viewingHistory = loadViewingHistory();
let searchResults = [];  // 儲存搜尋結果

function renderPagination(totalPages) {
    const paginationContainer = document.getElementById("pagination-container");
    paginationContainer.innerHTML = ""; // 清空現有分頁按鈕

    if (totalPages <= 1) {
        return; // 無需分頁
    }

    // 建立上一頁按鈕
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            paginateArticles(searchResults, currentPage);
        }
    });

    paginationContainer.appendChild(prevButton);

    // 建立分頁按鈕
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.classList.add("pagination-btn");
        if (i === currentPage) {
            pageButton.classList.add("active");
        }
        pageButton.addEventListener("click", () => {
            currentPage = i;
            paginateArticles(searchResults, currentPage);
        });

        paginationContainer.appendChild(pageButton);
    }

    // 建立下一頁按鈕
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            paginateArticles(searchResults, currentPage);
        }
    });

    paginationContainer.appendChild(nextButton);
}



function loadRatings() {
    return JSON.parse(localStorage.getItem("ratings")) || [];
}


// 從 JSON 加載報導內容
fetch('articles.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(articles => {
        data = articles;
        populateThemeFilter(articles);  // 初始化主題選單

        const ratings = loadRatings();
        if (ratings.length === 0) {
            // 沒有評分資料，顯示隨機報導
            const randomArticles = getRandomArticles(articles, articlesPerPage);
            sortAndRenderArticlesByTitleAndDate(randomArticles);
        } else {
            // 有評分資料，顯示推薦報導
            const recommendedArticles = recommendArticles();
            const matchedArticles = data.filter(article =>
                recommendedArticles.some(rec => rec.title === article.Title)
            );
            if (matchedArticles.length > 0) {
                sortAndRenderArticlesByTitleAndDate(matchedArticles.slice(0, articlesPerPage));
            } else {
                const randomArticles = getRandomArticles(articles, articlesPerPage);
                sortAndRenderArticlesByTitleAndDate(randomArticles);
            }
        }
    })
    .catch(error => {
        console.error("Error loading articles:", error);
        document.getElementById("articles-container").innerHTML = `<p style="color: red;">Failed to load articles. Please try again later.</p>`;
    });

function renderArticle(article) {
    const container = document.getElementById("articles-container");

    if (!article.Content || Object.keys(article.Content).length === 0) {
        console.warn(`報導 "${article.Title}" 缺少內容`);
        return;
    }

    const articleElement = document.createElement("div");
    articleElement.classList.add("article");

    const contentLevels = Object.keys(article.Content)
        .filter(level => level.toLowerCase().includes("level"))
        .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

    let currentLevel = contentLevels[0];
    const themes = article.Themes ? article.Themes.join(", ") : "No Theme";
    const escapedTitle = article.Title.replace(/[^a-zA-Z0-9]/g, "_");

    articleElement.innerHTML = `
        <h2 class="title">${article.Title}</h2>
        <p class="date"><strong>Date:</strong> ${article.Date}</p>
        <p class="theme"><strong>Theme:</strong> ${themes}</p>
        <p class="current-level" id="current-level-${escapedTitle}"><strong>Current Level:</strong> ${currentLevel.match(/\d+/)[0]}</p>
        <div class="content" id="content-${escapedTitle}">
            <p>${article.Content[currentLevel] || "Content not available"}</p>
        </div>
        <div class="level-buttons" id="buttons-${escapedTitle}"></div>
    `;

    const contentContainer = articleElement.querySelector(`#content-${escapedTitle}`);
    const levelDisplay = articleElement.querySelector(`#current-level-${escapedTitle}`);
    const buttonsContainer = articleElement.querySelector(`#buttons-${escapedTitle}`);

    // 生成等級按鈕
    contentLevels.forEach(level => {
        const levelButton = document.createElement("button");
        const levelNumber = level.match(/\d+/)[0];
        levelButton.textContent = `Level ${levelNumber}`;
        levelButton.classList.add("level-btn");

        levelButton.addEventListener("click", () => {
            const selectedContent = article.Content[level] || "Content not available";
            contentContainer.innerHTML = `<p>${selectedContent}</p>`;
            levelDisplay.innerHTML = `<strong>Current Level:</strong> ${levelNumber}`;
            currentLevel = level;

            // 根據 localStorage 更新星級
            const selectedRating = loadRating(article.Title, currentLevel) || 0;
            updateStars(ratingContainer, selectedRating);

            ratingResult.textContent = selectedRating > 0
                ? `You rated: ${selectedRating} stars.`
                : "No rating yet.";
        });

        buttonsContainer.appendChild(levelButton);
    });

    // 添加下載按鈕
    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Download";
    downloadButton.classList.add("download-btn");
    downloadButton.id = `download-${escapedTitle}`;

    downloadButton.addEventListener("click", () => {
        const currentContent = article.Content[currentLevel] || "Content not available";
        const txtContent = `
Title: ${article.Title}
Date: ${article.Date}
Theme: ${themes}
Current Level: ${currentLevel.match(/\d+/)[0]}
Content:
${currentContent}
        `.trim();

        // 建立 Blob 物件並觸發下載
        const blob = new Blob([txtContent], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${article.Title.replace(/[^a-zA-Z0-9]/g, "_")}_Level${currentLevel.match(/\d+/)[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    buttonsContainer.appendChild(downloadButton);

    // 星級評分區域
    const ratingContainer = document.createElement("div");
    ratingContainer.classList.add("rating-container");
    ratingContainer.id = `rating-${escapedTitle}`;

    let selectedRating = loadRating(article.Title, currentLevel) || 0;
    const ratingResult = document.createElement("p");
    ratingResult.id = `rating-result-${escapedTitle}`;
    ratingResult.textContent = selectedRating > 0 ? `You rated: ${selectedRating} stars.` : "No rating yet.";
    ratingContainer.appendChild(ratingResult);

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.textContent = "★";
        star.classList.add("star");
        star.dataset.value = i;

        star.addEventListener("click", () => {
            selectedRating = i;
            updateStars(ratingContainer, selectedRating);
            ratingResult.textContent = `You rated: ${i} stars.`;
            saveRating(article.Title, currentLevel, themes, i);
        });

        ratingContainer.appendChild(star);
    }

    updateStars(ratingContainer, selectedRating);
    buttonsContainer.after(ratingContainer);
    container.appendChild(articleElement);
    addToViewingHistory(article);
}




function loadViewingHistory() {
    const savedHistory = JSON.parse(localStorage.getItem("viewingHistory")) || [];
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // 過濾三天內的紀錄
    return savedHistory.filter(article => new Date(article.viewedAt) >= threeDaysAgo);
}

function saveViewingHistory() {
    localStorage.setItem("viewingHistory", JSON.stringify(viewingHistory));
}

function addToViewingHistory(article) {
    if (!viewingHistory.some(item => item.Title === article.Title && item.Date === article.Date)) {
        article.viewedAt = new Date().toISOString();
        viewingHistory.push(article);
        console.log(`已加入瀏覽紀錄: ${article.Title}`);
        saveViewingHistory();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    viewingHistory = loadViewingHistory();
    console.log("載入的瀏覽紀錄:", viewingHistory);

    // 監聽輸入框的 Enter 鍵事件
    const searchInput = document.getElementById("keyword-input"); // 確保輸入框有 id="keyword-input"
    if (searchInput) {
        searchInput.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault(); // 防止預設行為
                document.getElementById("filter-btn").click(); // 觸發 Submit 按鈕點擊事件
            }
        });
    }
});


function populateThemeFilter(articles) {
    const themeFilter = document.getElementById("theme-filter");
    const uniqueThemes = new Set();

    articles.forEach(article => {
        if (article.Themes) {
            article.Themes.forEach(theme => uniqueThemes.add(theme));
        }
    });

    uniqueThemes.forEach(theme => {
        const option = document.createElement("option");
        option.value = theme.toLowerCase();
        option.textContent = theme;
        themeFilter.appendChild(option);
    });
}

function sortAndRenderArticlesByTitleAndDate(articles) {
    const sortedArticles = articles.sort((a, b) => {
        const titleComparison = a.Title.localeCompare(b.Title);
        if (titleComparison !== 0) {
            return titleComparison;  // 按標題排序 (A-Z)
        }
        return new Date(b.Date) - new Date(a.Date);  // 時間從新到舊
    });
    paginateArticles(sortedArticles, currentPage);
}

function searchArticles() {
    const searchInput = document.getElementById("keyword-input");
    const searchKeyword = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const selectedLevel = document.getElementById("difficulty").value;
    const selectedTheme = document.getElementById("theme-filter").value.toLowerCase();
    const dataSource = document.getElementById("data-source").value;

    const sourceData = dataSource === "history" ? viewingHistory : data;

    searchResults = sourceData.filter(article => {
        // 比對等級
        const levelKeys = Object.keys(article.Content).map(level => level.match(/\d+/)[0]);
        const levelMatch = selectedLevel === "all" || levelKeys.includes(selectedLevel);

        // 比對主題
        const themeMatch = selectedTheme === "all" || article.Themes.some(t => t.toLowerCase() === selectedTheme);

        // 比對標題與內容 (若有輸入關鍵字才篩選)
        const titleMatch = searchKeyword === "" || article.Title.toLowerCase().includes(searchKeyword);
        const contentMatch = searchKeyword === "" || Object.values(article.Content).some(content => content.toLowerCase().includes(searchKeyword));

        return levelMatch && themeMatch && (titleMatch || contentMatch);
    });

    // 重置分頁與渲染結果
    currentPage = 1;
    sortAndRenderArticlesByTitleAndDate(searchResults);
    createPaginationControls(searchResults.length, currentPage);
}


document.getElementById("filter-btn").addEventListener("click", searchArticles);

function getRandomArticles(articles, count) {
    const shuffled = [...articles].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function paginateArticles(articles) {
    const container = document.getElementById("articles-container");
    container.innerHTML = ""; // 清空現有內容

    if (!articles || articles.length === 0) {
        container.innerHTML = "<p>No articles found.</p>";
        return;
    }

    const totalPages = Math.ceil(articles.length / articlesPerPage);

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;

    const paginatedArticles = articles.slice(startIndex, endIndex);

    paginatedArticles.forEach(article => {
        renderArticle(article);
    });

    renderPagination(totalPages);
}


function createPaginationControls(totalArticles, currentPage) {
    const paginationContainer = document.getElementById("pagination-container");
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalArticles / articlesPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.classList.add("pagination-btn");
        if (i === currentPage) {
            pageButton.classList.add("active");
        }
        pageButton.addEventListener("click", () => {
            currentPage = i;
            paginateArticles(searchResults, currentPage);
        });
        paginationContainer.appendChild(pageButton);
    }
    paginationContainer.style.textAlign = "center";
}

document.getElementById("refresh-link").addEventListener("click", (event) => {
    event.preventDefault(); // 阻止預設跳轉行為
    location.reload();      // 重新載入頁面
});

function loadRating(title, level) {
    const storedData = JSON.parse(localStorage.getItem("ratings")) || [];
    const ratingEntry = storedData.find(
        (item) => item.title === title && item.level === level
    );
    return ratingEntry ? ratingEntry.rating : null;
}

function calculateAverageRatings(ratings) {
    const aggregatedRatings = {};

    ratings.forEach(({ title, rating }) => {
        if (!aggregatedRatings[title]) {
            aggregatedRatings[title] = { total: 0, count: 0 };
        }
        aggregatedRatings[title].total += rating;
        aggregatedRatings[title].count += 1;
    });

    // 計算平均分數
    const averageRatings = Object.entries(aggregatedRatings).map(([title, data]) => ({
        title,
        averageRating: data.total / data.count,
    }));

    return averageRatings.sort((a, b) => b.averageRating - a.averageRating);
}


function calculateWeightedScores(ratings, userPreferences) {
    const weightedScores = {};

    ratings.forEach(({ title, level, themes, rating }) => {
        let score = rating;

        // 主題加權
        const matchingThemes = themes.split(", ").filter((theme) =>
            userPreferences.themes.includes(theme)
        ).length;
        score += matchingThemes * 1; // 每個匹配主題 +1 分

        // 等級匹配加權
        if (userPreferences.levels.includes(level)) {
            score += 2; // 完全匹配等級 +2 分
        }

        if (!weightedScores[title]) {
            weightedScores[title] = { total: 0, count: 0 };
        }

        weightedScores[title].total += score;
        weightedScores[title].count += 1;
    });

    return Object.entries(weightedScores).map(([title, data]) => ({
        title,
        weightedScore: data.total / data.count,
    })).sort((a, b) => b.weightedScore - a.weightedScore);
}


function recommendArticles() {
    const ratings = loadRatings();
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    if (ratings.length === 0) {
        console.log("無評分資料，無法推薦報導。");
        return [];
    }

    // 取得已評分標題
    const ratedTitles = ratings.map(rating => rating.title);

    // 取得最近一天內已瀏覽的標題
    const recentlyViewedTitles = viewingHistory
        .filter(article => new Date(article.viewedAt) >= oneDayAgo)
        .map(article => article.Title);

    // 過濾已評分與已瀏覽的報導
    const filteredArticles = data.filter(article =>
        !ratedTitles.includes(article.Title) &&
        !recentlyViewedTitles.includes(article.Title)
    );

    console.log("推薦報導清單 (已過濾):", filteredArticles);
    
    // **補充邏輯：無符合條件的推薦報導時，顯示隨機報導**
    if (filteredArticles.length === 0) {
        console.log("無符合條件的推薦報導，顯示隨機報導。");
        return getRandomArticles(data, 10);
    }

    // 從過濾後的報導中，隨機選擇最多10則推薦
    return getRandomArticles(filteredArticles, 10);
}



function saveRating(title, level, themes, rating) {
    const ratingData = {
        title: title,
        level: level,
        themes: themes,
        rating: rating,
        date: new Date().toISOString(),
    };

    let storedData = JSON.parse(localStorage.getItem("ratings")) || [];

    const existingIndex = storedData.findIndex(
        (item) => item.title === title && item.level === level
    );

    if (existingIndex !== -1) {
        storedData[existingIndex] = ratingData;
        console.log(`更新評分：${title} (Level ${level}) -> ${rating} 星`);
    } else {
        storedData.push(ratingData);
        console.log(`新增評分：${title} (Level ${level}) -> ${rating} 星`);
    }

    localStorage.setItem("ratings", JSON.stringify(storedData));
    console.log("目前儲存的評分資料：", storedData);
}



function updateStars(ratingContainer, selectedRating) {
    const allStars = ratingContainer.querySelectorAll(".star");
    allStars.forEach((star) => {
        const value = parseInt(star.dataset.value, 10);
        star.style.color = value <= selectedRating ? "gold" : "gray";
    });
}
