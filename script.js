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

// 渲染文章的函式
function renderArticles(filteredArticles) {
    const container = document.getElementById('articles-container');
    if (!container) {
        console.error('找不到文章容器 (articles-container)');
        return;
    }

    container.innerHTML = ''; // 清空舊內容
    filteredArticles.forEach(article => {
        const articleHTML = `
            <div class="article">
                <h2>${article.Title}</h2>
                <p><strong>主題:</strong> ${article.Theme}</p>
                <p><strong>日期:</strong> ${article.Date}</p>
                <p><strong>難度:</strong> Level ${article.Level}</p>
                <p>${article.Content}</p>
            </div>
        `;
        container.innerHTML += articleHTML;
    });
}

// 篩選與搜尋的函式
function filterArticles() {
    const difficulty = document.getElementById('difficulty').value;
    const themeKeyword = document.getElementById('theme').value.toLowerCase();

    const filteredArticles = articles.filter(article => {
        const matchDifficulty = difficulty === "all" || article.Level.toString() === difficulty;
        const matchTheme = themeKeyword === "" || article.Theme.toLowerCase().includes(themeKeyword);
        return matchDifficulty && matchTheme;
    });

    renderArticles(filteredArticles);
}

// 綁定篩選按鈕事件
document.getElementById('filter-btn').addEventListener('click', filterArticles);
