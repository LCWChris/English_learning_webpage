document.addEventListener("DOMContentLoaded", () => {
    // Fetch data from the server
    fetch('/get_articles')
        .then(response => response.json())
        .then(data => renderArticles(data));

    // Event listeners for search and difficulty
    document.getElementById("search-bar").addEventListener("input", filterArticles);
    document.getElementById("difficulty").addEventListener("change", filterArticles);
});

let articles = [];

// Render articles dynamically
function renderArticles(data) {
    articles = data;
    const container = document.getElementById("article-container");
    container.innerHTML = '';
    data.forEach(article => {
        const div = document.createElement("div");
        div.className = "article";
        div.innerHTML = `
            <h3>${article.title}</h3>
            <p>${article.content}</p>
            <small>難度：${article.difficulty}</small>
        `;
        container.appendChild(div);
    });
}

// Filter articles based on input
function filterArticles() {
    const searchTerm = document.getElementById("search-bar").value.toLowerCase();
    const selectedDifficulty = document.getElementById("difficulty").value;
    const filtered = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm) &&
        (selectedDifficulty === "0" || article.difficulty == selectedDifficulty)
    );
    renderArticles(filtered);
}
