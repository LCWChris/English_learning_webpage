let articles = []; // 初始化為空

// 從 JSON 檔案動態載入文章
fetch('articles.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('無法載入 JSON 檔案');
        }
        return response.json();
    })
    .then(data => {
        articles = data; // 載入 JSON 資料
        renderArticles(articles); // 預設渲染所有文章
    })
    .catch(error => {
        console.error('載入文章資料時發生錯誤:', error);
    });

// 渲染文章的函数
function renderArticles(filteredArticles) {
    const container = document.getElementById('articles-container');
    if (!container) {
        console.error('找不到文章容器 (articles-container)');
        return;
    }

    container.innerHTML = ''; // 清空旧内容
    filteredArticles.forEach(article => {
        // 创建下载文件的内容
        const fileContent = `
            Title: ${article.Title}
            Theme: ${article.Theme}
            Date: ${article.Date}
            Difficulty Level: ${article.Level}
            
            Content:
            ${article.Content}
        `.trim();

        // 生成下载按钮
        const downloadButton = `
            <button class="download-btn" onclick="downloadArticle('${article.Title}', \`${fileContent}\`)">下載文章</button>
        `;

        // 創建文章 HTML
        const articleHTML = `
            <div class="article">
                <h2>${article.Title}</h2>
                <p><strong>主題:</strong> ${article.Theme}</p>
                <p><strong>日期:</strong> ${article.Date}</p>
                <p><strong>難度:</strong> Level ${article.Level}</p>
                <p>${article.Content}</p>
                <button class="download-btn" onclick="downloadArticle('${article.Title}', \`${fileContent}\`)">下載文章</button>
            </div>
        `;
        container.innerHTML += articleHTML;
    });
}
// 下载文章的函数
function downloadArticle(title, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title}.txt`; // 文件名为文章标题
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 篩選與搜尋的函式
function filterArticles() {
    const difficulty = document.getElementById('difficulty').value; // 難度篩選條件
    const themeKeyword = document.getElementById('theme').value.trim().toLowerCase(); // 去除多餘空格並轉為小寫

    // 篩選文章
    const filteredArticles = articles.filter(article => {
        // 比對難度：選擇"全部" (all) 或符合指定的難度
        const matchDifficulty = difficulty === "all" || article.Level.toString() === difficulty;

        // 比對主題：若無輸入關鍵字，則自動匹配；若有關鍵字，檢查是否包含於 Title 或 Theme
        const matchTheme = themeKeyword === "" || 
                           article.Theme.toLowerCase().includes(themeKeyword) || 
                           article.Title.toLowerCase().includes(themeKeyword);

        // 同時滿足兩個條件
        return matchDifficulty && matchTheme;
    });

    // 渲染篩選結果
    renderArticles(filteredArticles);
}

// 綁定篩選按鈕事件
document.getElementById('filter-btn').addEventListener('click', filterArticles);