// 從 JSON 文件載入文章數據
fetch('./articles.json')
  .then((response) => response.json())
  .then((data) => {
    const contentDiv = document.getElementById('content');
    const filterSelect = document.getElementById('difficulty-filter');
    const searchBar = document.getElementById('search-bar');

    // 初始化文章顯示
    let articles = data;

    function displayArticles(filteredArticles) {
        contentDiv.innerHTML = ''; // 清空內容
        filteredArticles.forEach((article) => {
            const articleDiv = document.createElement('div');
            articleDiv.classList.add('article');
            articleDiv.innerHTML = `
                <h2>${article.Title}</h2>
                <p><strong>主題:</strong> ${article.Theme}</p>
                <p>${article['level 0 content'] || article['level 1 content'] || 
                     article['level 2 content'] || article['level 3 content'] || 
                     article['level 4 content'] || article['level 5 content'] || 
                     article['level 6 content']}</p>
            `;
            contentDiv.appendChild(articleDiv);
        });
    }

    // 首次顯示所有文章
    displayArticles(articles);

    // 篩選功能
    filterSelect.addEventListener('change', () => {
        const selectedLevel = filterSelect.value;
        const filteredArticles = articles.filter((article) => {
            const levels = [
                'level 0 content', 'level 1 content', 'level 2 content',
                'level 3 content', 'level 4 content', 'level 5 content', 'level 6 content'
            ];
            if (selectedLevel === '') return true;
            return article[`level ${selectedLevel} content`];
        });
        displayArticles(filteredArticles);
    });

    // 搜尋功能
    searchBar.addEventListener('input', () => {
        const query = searchBar.value.toLowerCase();
        const filteredArticles = articles.filter((article) => {
            return article.Title.toLowerCase().includes(query);
        });
        displayArticles(filteredArticles);
    });
  })
  .catch((error) => console.error('Error loading articles:', error));
