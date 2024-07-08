document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '3b7ac70172854cf0be77e804e8dcf005';
    const url = `https://newsapi.org/v2/top-headlines?country=kh&apiKey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data); // Log the entire response for debugging
            const newsList = document.getElementById('news-list');
            if (Array.isArray(data.articles)) {
                data.articles.forEach(article => {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = article.url;
                    link.textContent = article.title;
                    listItem.appendChild(link);
                    newsList.appendChild(listItem);
                });
            } else {
                console.error('No articles found in the response');
                newsList.innerHTML = '<li>No articles found.</li>';
            }
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            const newsList = document.getElementById('news-list');
            newsList.innerHTML = '<li>Error fetching news. Please try again later.</li>';
        });
});
