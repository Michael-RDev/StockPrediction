// Function to set a cookie
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get the value of a cookie
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// dark mode toggle
var darkModeID = 0;
var isDarkMode = getCookie("dark-mode") != "false";
document.getElementById('dark-mode-toggle').addEventListener('click', function() {
    let newId = (darkModeID + 1)%256;
    darkModeID = newId;
    document.documentElement.classList.toggle('dark-mode');
    isDarkMode = document.documentElement.classList.contains("dark-mode");
    setCookie("dark-mode",isDarkMode ? "true" : "false");
    triggerAnimation();
    setTimeout(() => {
        if (newId == darkModeID)
            updateGraph();
    }, 500);
});



function round(x) {
    return (x) - ((x+0.5)%1);
}




const newsHolder = document.getElementById("news-holder");
const newsPopupFrame = document.getElementById("news-popup");

function openNewsPopup() {
    newsPopupFrame.classList.remove("hidden");

    triggerAnimation(newsPopupFrame);
}

newsPopupFrame.addEventListener("click", (event) => {
    if (event.target == newsPopupFrame) {
        newsPopupFrame.classList.add("hidden");
        triggerAnimation(newsPopupFrame);
    }
});



function updateNewsItems(newsList) {
    // news is in the format [{"news": string, "sentiment": float}]
    while (newsHolder.lastElementChild) {
        newsHolder.removeChild(newsHolder.lastElementChild);
    }

    for (const news of newsList) {
        const holder = document.createElement("div");
        holder.className = "holder news-element";

        const text = document.createElement("p");
        text.appendChild(document.createTextNode(news.title));

        const bar = document.createElement("div");
        bar.className = "news-element-bar";
        bar.title = "Sentiment";

        const subbar = document.createElement("div");
        bar.appendChild(subbar);

        subbar.classList.add(news.sentiment < 0 ? "negative" : "positive");

        holder.appendChild(text);
        holder.appendChild(bar);

        newsHolder.appendChild(holder);
        //document.styleSheets[0].insertRule(`.news-element .bar::after { --sentiment: ${round(100*news.sentiment)}%; }`)
        //window.getComputedStyle(bar, '::after').setProperty("width",`${round(news.sentiment*100)}%`);
        setTimeout(() => {
            subbar.style.width = `${round(50*Math.abs(news.sentiment))}%`;
        }, 100);
        
        
        holder.addEventListener("click", () => {
            openNewsPopup();
            document.getElementById("news-popup-title").textContent = news.title;
            document.getElementById("news-popup-description").textContent = news.description;
            document.getElementById("news-popup").classList.remove("hidden");

            const bar = document.getElementById("popup-sentiment-bar-inner");
            bar.style.width = '0%';
            bar.classList.remove("positive");
            bar.classList.remove("negative");
            bar.classList.add(news.sentiment < 0 ? "negative" : "positive");
            setTimeout(() => {
                bar.style.width = `${round(50*Math.abs(news.sentiment))}%`;
            }, 100);
        });
    }
}

function updateNews() {
    var stockSymbol = document.getElementById("stock-symbol-input").value;
    fetch("/get_news_data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            stock_symbol: stockSymbol,
        }),
    })
    .then(response => response.json())
    .then(data => {
        updateNewsItems(data);
    })
    .catch(error => console.error("Error:", error));

    // updateNewsItems([
    //     {"title":"this is a test. a company made a really bad decision...","sentiment":0.85},
    //     {"title":"apple made a brand new product that may revolutionize technology","sentiment":0.9},
    //     {"title":"a news company fired one of their managers","sentiment":0.4},
    //     {"title":"microsoft is still working on windows 12", "sentiment":0.3}
    // ]);
}

document.getElementById("news-refresh").addEventListener("click", updateNews);


// stock symbol input
const inputElement = document.getElementById("stock-symbol-input");
const canvas = document.getElementById("stock-display");
const loadStock = document.getElementById("load-stock");
const ctx = canvas.getContext('2d');
const inputCanvas = document.getElementById("interactive-display");
const inputctx = inputCanvas.getContext("2d");
const graphOverlay = document.getElementById("graph-overlay")

var isGraphLoading = false;

inputElement.addEventListener('input', function(event) {
    var currentValue = inputElement.value;
    var filteredValue = currentValue.toUpperCase() .replace(/[^A-Z0-9]/g, ''); // Keep only capital letters and numbers
    inputElement.value = filteredValue;
});

const maxTicks = 25;
    const scalingFactors = [1, 2, 5, 10, 25];

function calculateIncrement(min, max) {
    const range = max - min;

    let increment = 1; // Default increment

    // Iterate through scaling factors to find the lowest increment
    for (let i = 0; i < scalingFactors.length; i++) {
        const factor = scalingFactors[i];
        const ticks = range / factor + 1; // Calculate number of ticks

        // Check if the number of ticks is at most 25
        if (ticks <= 25) {
            increment = factor;
            break; // Found a suitable factor, exit the loop
        }
    }

    return increment;
}


function initCanvas() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Get the actual size of the canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Scale the canvas based on the device pixel ratio
    canvas.width = canvasWidth
    canvas.height = canvasHeight
}

const canvasPaddingLeft = 150;
const canvasPaddingRight = 150;
const canvasPaddingTop = 40;
const canvasPaddingBottom = 150;
const textPadding = 20;

function drawText(ctx, text, x, y, fontSize, font) {
    ctx.font = fontSize + 'px ' + font; // Set font style with specified font size
    ctx.fillText(text, x, y); // Draw text at position (x, y)
}

function formatDate(timestamp) {
    // Create a new Date object using the timestamp (in milliseconds)
    const date = new Date(timestamp * 1000);
    
    // Get the month, day, and year from the Date object
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so we add 1
    const day = date.getDate().toString().padStart(2, '0'); // Get the day of the month
    const year = date.getFullYear();
    
    // Format the date as MM/DD/YYYY
    const formattedDate = `${month}/${day}/${year}`;
    
    return formattedDate;
}

function drawGridlines(stockPrices, increment, minTimestamp, maxTimestamp, minPrice, maxPrice, numStocks) {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate the timestamp range
    const timestampRange = maxTimestamp - minTimestamp;
    
    
    // Calculate the price range and value intervals
    
    
    const lowPrice = Math.floor(minPrice/increment) * increment;
    const highPrice = Math.ceil(maxPrice/increment) * increment;
    const priceRange = highPrice - lowPrice;
    const valueInterval = priceRange / (canvasHeight - (canvasPaddingTop + canvasPaddingBottom));

    ctx.beginPath();
    ctx.strokeStyle = isDarkMode ? '#ddd' : '#111';
    ctx.fillStyle = isDarkMode ? 'white' : 'black';
    ctx.lineWidth = 2;

    for (let i = 0; i < numStocks; i++) {
        const x = Math.round(canvasPaddingLeft + (canvasWidth - (canvasPaddingLeft + canvasPaddingRight)) * ((60*60*24*i) / timestampRange));
        ctx.moveTo(x,canvasPaddingTop);
        ctx.lineTo(x,canvasHeight-canvasPaddingBottom);
        drawText(ctx,formatDate(minTimestamp + 60*60*24*i), x-90, canvasHeight-canvasPaddingBottom+textPadding*4,(increment/valueInterval)/3, "Arial")
    }

    for (let price = lowPrice; price <= highPrice; price += increment) {
        const y = Math.round(canvasHeight - canvasPaddingBottom - (price - lowPrice) / valueInterval);

        ctx.moveTo(canvasPaddingLeft,y);
        ctx.lineTo(canvasWidth-canvasPaddingRight,y);
        drawText(ctx,"$" + price, textPadding, y+5,(increment/valueInterval)/3, "Arial")
    }



    ctx.stroke();
}



function drawStockPriceGraph(stockPrices, increment, minTimestamp, maxTimestamp, minPrice, maxPrice, colorTheme) {
    // Get the actual size of the canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate the timestamp range
    const timestampRange = maxTimestamp - minTimestamp;

    // Find the minimum and maximum prices
    const lowPrice = Math.floor(minPrice/increment) * increment;
    const highPrice = Math.ceil(maxPrice/increment) * increment;
    const priceRange = highPrice - lowPrice;
    const valueInterval = priceRange / (canvasHeight - (canvasPaddingTop + canvasPaddingBottom));


    // Begin drawing the graph
   // ctx.beginPath();
    ctx.lineWidth = 5;
    let lastX = 0;
    let lastY = 0;
    // Iterate through the stock prices and draw the graph
    for (let i = 0; i < stockPrices.length; i++) {
        const data = stockPrices[i];
        
        // Calculate x and y coordinates based on timestamp and price
        const x = canvasPaddingLeft + (canvasWidth - (canvasPaddingLeft + canvasPaddingRight)) * ((data.date - minTimestamp) / timestampRange);
        const y = canvasHeight - canvasPaddingBottom - (data.price - lowPrice) / valueInterval;

        // Move to the first point or continue drawing lines
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.beginPath();
            ctx.moveTo(lastX,lastY)
            ctx.strokeStyle = data.type == "history" ? (isDarkMode ? '#c00' : '#f00') : (colorTheme != null ? (isDarkMode ? colorTheme.dark : colorTheme.light) : (isDarkMode ? '#00c' : "#00c"))//data.type == "predicted" ? (isDarkMode ? '#c00' : '#f00') : (isDarkMode ? '#00c' : "#00c");
            ctx.lineTo(x, y);
        ctx.stroke()
        }
        lastX = x;
        lastY = y;
    }

    // Set line color

    // Draw the graph
    //ctx.stroke();
}
var overlayID = {};
function triggerAnimation(element) {
    if (isGraphLoading && !element) return;
    document.getElementById("loadingBarHolder").style.display = "None";
    let id = ((overlayID[element || graphOverlay] || 0) + 1)%255;
    overlayID[element || graphOverlay] = id;
    (element || graphOverlay).classList.add("overlayAnimation");

    setTimeout(() => {
        if (overlayID[element || graphOverlay] == id)
            (element || graphOverlay).classList.remove("overlayAnimation");
    }, 600);
}


graphOverlay.addEventListener("mousemove", (event)=>{
    const boundingRect = inputCanvas.getBoundingClientRect();
    const scaleX = inputCanvas.width / boundingRect.width;
    const scaleY = inputCanvas.height / boundingRect.height;
    
    const mouseX = scaleX * (event.clientX - boundingRect.left - window.scrollX);
    const mouseY = scaleY * (event.clientY - boundingRect.top - window.scrollY);


    inputctx.clearRect(0, 0, inputCanvas.width, inputCanvas.height); // Clear previous frame
    inputctx.beginPath();
    inputctx.strokeStyle = isDarkMode ? "#bbb" : "#333";
    inputctx.lineWidth = 2;
    inputctx.moveTo(mouseX, 0); // Start point
    inputctx.lineTo(mouseX, inputCanvas.height); // End point
    inputctx.moveTo(0, mouseY); // Start point
    inputctx.lineTo(inputCanvas.width, mouseY); // End point
    inputctx.stroke();
})
graphOverlay.addEventListener("mouseleave", ()=>{
    inputctx.clearRect(0,0,inputCanvas.width,inputCanvas.height)
});

initCanvas();

let stockPrices = null;

var modelCheckboxes = {};
const checkboxes = document.getElementsByClassName("stock-algorithm-select");
for (var checkbox = 0; checkbox < checkboxes.length; checkbox++) {
    modelCheckboxes[checkboxes[checkbox].getAttribute("algorithm")] = checkboxes[checkbox];

    checkboxes[checkbox].addEventListener("change", (event)=>{
        triggerAnimation();
        setTimeout(() => {
            updateGraph();
        }, 500);
    });
}

const algorithmColorThemes = {
    "RANDOMFOREST": {"light": "#6ab04c", "dark": "#6ab04c"},
    "SVMMODEL": {"light": "#e4d424", "dark": "#e4d424"},
    "LINEARREGRESSION": {"light": "#28bdea", "dark": "#28bdea"}
}

var predictions;
var historicalData;

function updateGraph() {
    if (historicalData == null || predictions == null) return;
    var minPrice = Math.min(...historicalData.map(data => data.price));
    var maxPrice = Math.max(...historicalData.map(data => data.price));

    const minDate = Math.min(...historicalData.map(data => data.date));
    const maxDate = Math.max(...historicalData.map(data => data.date)) + 60*60*24;

    for (const key in predictions) {
        minPrice = Math.min(minPrice, predictions[key])
        maxPrice = Math.max(maxPrice, predictions[key])
    }


    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;


    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const increment = calculateIncrement(minPrice, maxPrice);
    drawGridlines(historicalData, increment, minDate, maxDate, minPrice, maxPrice, historicalData.length+1);
    drawStockPriceGraph(historicalData, increment, minDate, maxDate, minPrice, maxPrice);



    for (var model in predictions) {
        if (modelCheckboxes[model] != null && modelCheckboxes[model].checked) {
            const prediction = predictions[model];
            drawStockPriceGraph([historicalData[historicalData.length-1],{"date": maxDate, "price": prediction, "type": "prediction"}], increment, minDate, maxDate, minPrice, maxPrice, algorithmColorThemes[model]);
        }
    }
}

loadStock.addEventListener("click", ()=>{
    if (true) return;
    /*console.log("updatingg");
    ctx.moveTo(0, 0)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(500, 1000);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 5;
    ctx.stroke();*/

    triggerAnimation();

    const example = [
        { "date": 1648118400000, "price": 150.50, "volume": 10000, "type": "history"},
        { "date": 1648204800000, "price": 154.20, "volume": 12000, "type": "history"},
        { "date": 1648291200000, "price": 155.75, "volume": 9000, "type": "history"},
        { "date": 1648377600000, "price": 158.40, "volume": 11000, "type": "history"},
        { "date": 1648464000000, "price": 157.80, "volume": 8000, "type": "history"},
        { "date": 1648550400000, "price": 160.25, "volume": 13000, "type": "predicted"},
        { "date": 1648636800000, "price": 162.90, "volume": 10000, "type": "predicted"}
    ];
    stockPrices = example;
    setTimeout(() => {
        updateGraph();
    }, 500);
});


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("load-stock").addEventListener("click", function () {
        var stockSymbol = document.getElementById("stock-symbol-input").value;

        document.getElementById("stock-symbol-display").textContent = "Stock: "+stockSymbol;
        
        isGraphLoading = true;
        graphOverlay.classList.add("overlayAnimation");

        updateNews();

        setTimeout(() => {
            document.getElementById("loadingBar").style.width = "0%";
            const eventSource = new EventSource("/get_stock_data?stock="+stockSymbol);
            eventSource.onmessage = (event) => {
                var data = JSON.parse(event.data);
                console.log(data);
                switch(data.type) {
                    case "error":
                        console.log("error: "+data.error);
                        document.getElementById("stock-symbol-display").textContent = "Stock: None";
                        alert("Error predicting stock: "+(data.error || "No error message returned"));
                        isGraphLoading = false;
                        graphOverlay.classList.remove("overlayAnimation");
                        eventSource.close();
                        document.getElementById("loadingBar").style.width = "0%";
                        break;
                    case "progress":
                        document.getElementById("loadingBarHolder").style.display = "Block";
                        document.getElementById("loadingBar").style.width = Math.round(data.progress*100)+"%";
                        break;
                    case "done":
                        document.getElementById("loadingBarHolder").style.display = "Block";
                        document.getElementById("loadingBar").style.width = "100%";
                        historicalData = data.history;
                        predictions = data.data;
                        document.getElementById("stock-symbol-input").value = data.stock_symbol;
                        updateGraph();
                        isGraphLoading = false;
                        graphOverlay.classList.remove("overlayAnimation");
                        eventSource.close();
                        document.getElementById("loadingBar").style.width = "0%";
                        break;

                }
            }
            // Send AJAX request to Flask backend
            /*fetch("/get_stock_data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    stock_symbol: stockSymbol,
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    document.getElementById("stock-symbol-display").textContent = "Stock: None";
                    alert("Error predicting stock: "+(data.error || "No error message returned"));
                } else {
                    historicalData = data.history;
                    predictions = data.data;
                    document.getElementById("stock-symbol-input").value = data.stock_symbol;
                    updateGraph();
                }

                isGraphLoading = false;
                graphOverlay.classList.remove("overlayAnimation");

            })
            .catch(error => {
                console.error("Error:", error);
                document.getElementById("stock-symbol-display").textContent = "Stock: None";
                alert("Error predicting stock: Unknown error");
                isGraphLoading = false;
                graphOverlay.classList.remove("overlayAnimation");
            });*/
        }, 500);

        
    });
});
