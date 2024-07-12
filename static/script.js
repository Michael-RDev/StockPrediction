document.getElementById('stockSymbol').addEventListener('input', function() {
    var stockSymbol = this.value.trim();

    // Fetch stock info
    fetch('/api/stockInfo?stock=' + stockSymbol)
    .then(response => response.json())
    .then(data => {
        if (data.exists) {
            document.getElementById('companyName').innerText = data.companyName;
        } else {
            document.getElementById('companyName').innerText = 'Company not found';
        }
    })
    .catch(error => {
        console.error('Error fetching stock info:', error);
    });

    // Fetch news
    fetch('/api/news?stock=' + stockSymbol)
    .then(response => response.json())
    .then(data => {
        var newsContainer = document.getElementById('newsList');
        newsContainer.innerHTML = ''; // Clear previous news items
        data.forEach(newsItem => {
            var newsItemElement = document.createElement('div');
            newsItemElement.classList.add('news-item');
            newsItemElement.innerHTML = '<h3>' + newsItem.headline + '</h3>' +
                                        '<p>Sentiment: ' + newsItem.sentiment + '</p>';
            newsContainer.appendChild(newsItemElement);
        });
    })
    .catch(error => {
        console.error('Error fetching news:', error);
    });

    // Fetch stock data (you can implement this using a library like Chart.js or D3.js)
    // Here, I'm assuming you'll implement it using Canvas element directly
    fetch('/api/stockData?stock=' + stockSymbol)
    .then(response => response.json())
    .then(data => {
        drawStockChart(data); // Function to draw stock chart on canvas
    })
    .catch(error => {
        console.error('Error fetching stock data:', error);
    });
});

function drawStockChart(stockData) {
    // Code to draw stock chart using Canvas
}
