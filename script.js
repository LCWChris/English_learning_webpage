// 動態載入 JSON 並渲染文章
fetch('./articles.json')
  .then(response => response.json())
  .then(data => {
    const contentDiv = document.getElementById('content');
    const filterBtn = document.getElementById('filter-btn');
    const difficultySelect = document.getElementById('difficulty');
    const themeInput = document.getElementById('theme');

    // 初始渲染
    renderArticles(data);

    // 點擊篩選按鈕
    filterBtn.addEventListener('click', () => {
      const selectedDifficulty = difficultySelect.value;
      const themeKeyword = themeInput.value.toLowerCase();

      // 篩選文章
      const filteredArticles = data.filter(article => {
        const matchesDifficulty =
          selectedDifficulty === 'all' || article.Level.toString() === selectedDifficulty;
        const matchesTheme = article.Theme.toLowerCase().includes(themeKeyword);
        return matchesDifficulty && matchesTheme;
      });

      renderArticles(filteredArticles);
    });

    // 渲染文章函式
    function renderArticles(articles) {
      contentDiv.innerHTML = '';
      if (articles.length === 0) {
        contentDiv.innerHTML = '<p>未找到符合條件的文章。</p>';
        return;
      }
      articles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article');
        articleDiv.innerHTML = `
          <h2>${article.Title}</h2>
          <p><strong>主題：</strong>${article.Theme}</p>
          <p><strong>難度：</strong>Level ${article.Level}</p>
          <p>${article.Content}</p>
        `;
        contentDiv.appendChild(articleDiv);
      });
    }
  })
  .catch(err => console.error('Error loading articles:', err));
