// 假設 JSON 文件的路徑是 './articles.json'
fetch('articles.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`無法載入 JSON 檔案: ${response.status}`);
    }
    return response.json();
  })
  .then(articles => {
    renderArticles(articles);
  })
  .catch(error => {
    console.error('載入 JSON 時發生錯誤:', error);
  });

// 渲染文章的函式
function renderArticles(articles) {
  const container = document.getElementById('articles-container');
  if (!container) {
    console.error('找不到文章容器 (content)');
    return;
  }

  container.innerHTML = ''; // 清空舊內容

  articles.forEach(article => {
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
