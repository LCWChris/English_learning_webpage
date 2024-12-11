let data = [];
let currentPage = 1;
const articlesPerPage = 10;

// 從 JSON 加載報導內容
fetch('articles.json')
    .then(response => response.json())
    .then(articles => {
        data = articles;
        populateThemeFilter(articles);  // 初始化主題選單
        const randomArticles = getRandomArticles(articles, articlesPerPage);  // 隨機選擇10篇文章
        sortAndRenderArticlesByDate(randomArticles);  // 初次載入按時間排序
    });

// 生成主題選單
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

// 搜尋文章
function searchArticles() {
    const selectedLevel = document.getElementById("difficulty").value;
    const selectedTheme = document.getElementById("theme-filter").value.toLowerCase();
    const keyword = document.getElementById("theme").value.toLowerCase().trim();

    const filteredData = data.filter(article => {
        const levelKeys = Object.keys(article.Content).map(level => level.match(/\d+/)[0]);
        const levelMatch = selectedLevel === "all" || levelKeys.includes(selectedLevel);

        const themeMatch = selectedTheme === "all" || article.Themes.some(t => t.toLowerCase() === selectedTheme);

        const titleMatch = article.Title.toLowerCase().includes(keyword);
        const contentMatch = Object.values(article.Content)
            .some(content => content.toLowerCase().includes(keyword));

        return levelMatch && themeMatch && (titleMatch || contentMatch);
    });

    currentPage = 1; currentPage = 1; sortAndRenderArticlesByDate(filteredData); createPaginationControls(filteredData, currentPage);
}

document.getElementById("filter-btn").addEventListener("click", searchArticles);

// 隨機選擇報導
function getRandomArticles(articles, count) {
    const shuffled = [...articles].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 按時間排序並渲染報導內容
function sortAndRenderArticlesByDate(articles) {
    const sortedArticles = articles.sort((a, b) => new Date(b.Date) - new Date(a.Date));
    paginateArticles(sortedArticles, currentPage);
}

// 渲染分頁的報導內容
function paginateArticles(filteredData, page) {
    const container = document.getElementById("articles-container");
    container.innerHTML = "";  // 清空容器內容

    const start = (page - 1) * articlesPerPage;
    const end = start + articlesPerPage;
    const paginatedData = filteredData.slice(start, end);

    paginatedData.forEach(article => {
        renderArticle(article);
    });

    createPaginationControls(filteredData.length, currentPage);
}

// 渲染單篇報導
function renderArticle(article) {
    const container = document.getElementById("articles-container");

    const contentLevels = Object.keys(article.Content)
        .filter(level => level.includes("level"))
        .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

    const initialLevel = contentLevels[0];
    const initialLevelNumber = initialLevel.match(/\d+/)[0];
    const initialContent = article.Content[initialLevel] || "Content not available";

    const themes = article.Themes ? article.Themes.join(", ") : "No Theme";

    const articleElement = document.createElement("div");
    articleElement.classList.add("article");

    articleElement.innerHTML = `
        <h2 class="title">${article.Title}</h2>
        <p class="date"><strong>Date:</strong> ${article.Date}</p>
        <p class="theme"><strong>Theme:</strong> ${themes}</p>
        <p class="current-level" id="current-level-${article.Date}">
            <strong>Current Level:</strong> ${initialLevelNumber}
        </p>
        <div class="content">
            <p id="article-content-${article.Date}" data-current-level="${initialLevel}">
                ${initialContent}
            </p>
        </div>
        <div class="controls" id="controls-${article.Date}">
            <div class="level-buttons" id="level-buttons-${article.Date}"></div>
            <button class="download-btn" data-date="${article.Date}">Download</button>
        </div>
    `;

    container.appendChild(articleElement);

    if (contentLevels.length > 1) {
        const controlsContainer = document.getElementById(`level-buttons-${article.Date}`);
        contentLevels.forEach(level => {
            const button = document.createElement("button");
            const levelNumber = level.match(/\d+/)[0];
            button.textContent = `Level ${levelNumber}`;
            button.dataset.date = article.Date;
            button.dataset.level = level;
            button.classList.add("level-btn");

            if (level === initialLevel) {
                button.classList.add("active");
            }
            controlsContainer.appendChild(button);
        });
    }
}

// 處理按鈕點擊事件
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("level-btn")) {
        const date = e.target.dataset.date;
        const level = e.target.dataset.level;
        const contentId = `article-content-${date}`;
        const levelDisplayId = `current-level-${date}`;
        const article = data.find(a => a.Date === date);

        document.getElementById(contentId).innerText = article.Content[level] || "Content not available";
        document.getElementById(contentId).dataset.currentLevel = level;
        document.getElementById(levelDisplayId).innerHTML = `<strong>Current Level:</strong> ${level.match(/\d+/)[0]}`;

        const buttons = document.querySelectorAll(`#level-buttons-${date} .level-btn`);
        buttons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.level === level);
        });
    }

    if (e.target.classList.contains("download-btn")) {
        const date = e.target.dataset.date;
        const article = data.find(a => a.Date === date);
        const contentId = `article-content-${date}`;
        const contentElement = document.getElementById(contentId);
        const currentLevel = contentElement.dataset.currentLevel;
        const textContent = `
Date: ${article.Date}
Title: ${article.Title}
Theme: ${article.Themes.join(", ")}
Current Level: ${currentLevel.match(/\d+/)[0]}
${article.Content[currentLevel] || "Content not available"}
        `;

        const blob = new Blob([textContent], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${article.Title.replace(/\s+/g, "_")}.txt`;
        link.click();
    }
});

// 創建頁碼按鈕
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
            paginateArticles(filteredData, currentPage);
            paginateArticles(filteredData, currentPage);
        });
        paginationContainer.appendChild(pageButton);
    }
    paginationContainer.style.textAlign = "center";
}
