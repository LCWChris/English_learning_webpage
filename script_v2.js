
let data = [];

// 從 JSON 加載報導內容
fetch('articles_v2.json')
    .then(response => response.json())
    .then(articles => {
        data = articles;
        populateThemeFilter(articles);  // 初始化主題選單
        sortAndRenderArticles(data);  // 初次載入按日期排序
    });

// 生成主題選單
function populateThemeFilter(articles) {
    const themeFilter = document.getElementById("theme-filter");
    const uniqueThemes = new Set();

    // 收集所有主題
    articles.forEach(article => {
        if (article.Themes) {
            article.Themes.forEach(theme => uniqueThemes.add(theme));
        }
    });

    // 動態新增主題選項
    uniqueThemes.forEach(theme => {
        const option = document.createElement("option");
        option.value = theme.toLowerCase();
        option.textContent = theme;
        themeFilter.appendChild(option);
    });
}

// 排序並渲染報導內容
function sortAndRenderArticles(articles) {
    const sortedArticles = articles.sort((a, b) => new Date(b.Date) - new Date(a.Date));
    renderArticles(sortedArticles);
}


// 渲染報導內容
function renderArticles(filteredData) {
    const container = document.getElementById("articles-container");
    container.innerHTML = "";  // 清空容器內容

    filteredData.forEach(article => {
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
    });
}

// 關鍵字與等級篩選邏輯
document.getElementById("filter-btn").addEventListener("click", () => {
    const selectedLevel = document.getElementById("difficulty").value;
    const selectedTheme = document.getElementById("theme-filter").value.toLowerCase();
    const keyword = document.getElementById("theme").value.toLowerCase().trim();
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    const filteredData = data.filter(article => {
        // 等級比對
        const levelKeys = Object.keys(article.Content).map(level => level.match(/\d+/)[0]);
        const levelMatch = selectedLevel === "all" || levelKeys.includes(selectedLevel);

        // 主題比對
        const themeMatch = selectedTheme === "all" || article.Themes.some(t => t.toLowerCase() === selectedTheme);

        // 關鍵字比對
        const titleMatch = article.Title.toLowerCase().includes(keyword);
        const contentMatch = Object.values(article.Content)
            .some(content => content.toLowerCase().includes(keyword));

        // 日期範圍比對
        const articleDate = new Date(article.Date);
        const dateMatch = (!startDate || articleDate >= new Date(startDate)) &&
                          (!endDate || articleDate <= new Date(endDate));

        return levelMatch && themeMatch && dateMatch && (titleMatch || contentMatch);
    });

    // 根據篩選順序排序：Title 優先 -> Content -> Date (新到舊)
    const sortedData = filteredData.sort((a, b) => {
        const aTitleMatch = a.Title.toLowerCase().includes(keyword) ? 0 : 1;
        const bTitleMatch = b.Title.toLowerCase().includes(keyword) ? 0 : 1;

        if (aTitleMatch !== bTitleMatch) {
            return aTitleMatch - bTitleMatch;
        }

        const aContentMatch = Object.values(a.Content).some(content => content.toLowerCase().includes(keyword)) ? 0 : 1;
        const bContentMatch = Object.values(b.Content).some(content => content.toLowerCase().includes(keyword)) ? 0 : 1;

        if (aContentMatch !== bContentMatch) {
            return aContentMatch - bContentMatch;
        }

        // 日期比較（從新到舊）
        return new Date(b.Date) - new Date(a.Date);
    });

    renderArticles(sortedData);  // 渲染篩選結果
});

// 處理按鈕點擊事件
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("level-btn")) {
        const date = e.target.dataset.date;
        const level = e.target.dataset.level;
        const levelNumber = level.match(/\d+/)[0];
        const contentId = `article-content-${date}`;
        const levelDisplayId = `current-level-${date}`;
        const article = data.find(a => a.Date === date);
        const newContent = article.Content[level] || "Content not available";

        // 更新內容與等級顯示
        document.getElementById(contentId).innerText = newContent;
        document.getElementById(contentId).dataset.currentLevel = level;
        document.getElementById(levelDisplayId).innerHTML = `<strong>Current Level:</strong> ${levelNumber}`;

        // 更新按鈕樣式
        const buttons = document.querySelectorAll(`#level-buttons-${date} .level-btn`);
        buttons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.level === level);
        });
    }

    // 處理下載功能
    if (e.target.classList.contains("download-btn")) {
        const date = e.target.dataset.date;
        const article = data.find(a => a.Date === date);
        const contentId = `article-content-${date}`;
        const contentElement = document.getElementById(contentId);
        const currentLevel = contentElement.dataset.currentLevel;
        const currentLevelNumber = currentLevel.match(/\d+/)[0];

        const textContent = `
Date: ${article.Date}
Title: ${article.Title}
Theme: ${article.Themes.join(", ")}
LEVEL ${currentLevelNumber} Content:
${article.Content[currentLevel] || "Content not available"}
        `;

        // 下載為文本文件
        const blob = new Blob([textContent], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${article.Title.replace(/\s+/g, "_")}.txt`;
        link.click();
    }
});
