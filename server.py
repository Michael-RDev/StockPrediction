from flask import Flask, request, render_template, jsonify, send_file, Response
from stock_algorithms.gather_data import optimize_code_specific_symbols
from stock_algorithms.model_train import load_data, train_models, predict_next_stock, preprocess_data
import yfinance as yf
import numpy as np
from datetime import datetime, time, timedelta
import csv
import requests
from textblob import TextBlob
import pandas as pd
import json

app = Flask(__name__)

companyData = {}
with open("static/companyData.csv", 'r') as file:
    csv_reader = csv.reader(file)
    for row in csv_reader:
        if row:  # Check if the row is not empty
            key = row[0]
            value = row[1] if len(row) > 1 else None
            companyData[key] = value

def get_news_sentiment(company):
    API_KEY = ""
    query = f"{company} Stock"
    url = f"https://newsapi.org/v2/everything?q={query}&apiKey={API_KEY}"

    response = requests.get(url)
    response.raise_for_status()
    data = response.json()

    #print("Stock News:")
    news = []
    for article in data["articles"]:
        if str(company) in article["title"]: #and "stock" in article["title"]:
            sentiment = TextBlob(article["title"]).sentiment.polarity
            if sentiment != 0:
                title = article["title"]
                description = article["description"]
                
                news.append({"title":title,"description":description,"sentiment":sentiment})

    return news

                # print(f"\t- {article['title']}")
                # print(f"\t\t{article['description']}")
                # print(f"Sentiment: {sentiment}")
                # print(f"Subjectivity: {subjectivity}")
                # print()

@app.route('/', methods=['GET'])
def get_example():
    return render_template('index.html')

@app.route("/images/<path:imagePath>", methods=["GET"])
def get_images(imagePath: str):
    return send_file("images/" + imagePath, mimetype=(imagePath[len(imagePath) - imagePath[::-1].find(".") - 1: len(imagePath) - imagePath[::-1].find(".")] if imagePath[::-1].find(".") else imagePath[len(imagePath) - imagePath[::-1].find(".") - 1:]))

@app.route("/get_news_data", methods=["POST"])
def get_news_data():
    stock_symbol = request.json["stock_symbol"]

    company_name = companyData.get(stock_symbol)
    print("getting news for ",stock_symbol,":",company_name)
    if company_name:
        news = get_news_sentiment(company_name)
        return jsonify(news)
    return jsonify([])

def get_unix_timestamp(days_before):
    # Get today's date
    today = datetime.now()
    
    # Calculate the date for the specified number of days before today
    target_date = today - timedelta(days=days_before)
    
    # Convert the target date to a Unix timestamp
    unix_timestamp = int(target_date.timestamp())
    
    return unix_timestamp

def predict(stock_symbol):
    stock_symbol = [stock_symbol]#[request.json["stock_symbol"]] # max was here
    
    company_name = companyData.get(stock_symbol[0])
    if not company_name:
        yield "data: " + json.dumps({"type":"error","error":"Invalid Stock Symbol"}) + "\n\n"
        return
    
    yield "data: " + json.dumps({"type":"progress", "progress":"0.1"})+"\n\n"

    optimize_code_specific_symbols(stock_symbol) # get data

    algorithms = ["RANDOMFOREST", "SVMMODEL", "LINEARREGRESSION"]
    data_path = "data"

    if time(9, 30) <= datetime.now().time() <= time(16, 0):                                            
        is_latest = False
    else:
        is_latest = True # true if after 4 pm

    x_data, y_data = load_data(data_path)

    yield "data: " + json.dumps({"type":"progress", "progress":"0.15"})+"\n\n"

    latest_data = yf.download(stock_symbol, period='7d')
    yesterdays_data = yf.download(stock_symbol, period='1d')
    yield "data: " + json.dumps({"type":"progress", "progress":"0.2"})+"\n\n"
    latest_x_data, _ = preprocess_data(yesterdays_data, is_latest=is_latest, indexing=True)

    yield "data: " + json.dumps({"type":"progress", "progress":"0.25"})+"\n\n"


    historicalDataCloses = latest_data['Close'].tolist()

    historicalData = []

    for i,close in enumerate(historicalDataCloses):
        unix = get_unix_timestamp(6-i) #(pd.to_datetime(pd.DataFrame(latest_data[i])["Date"].index) - pd.Timestamp("1970-01-01")) // pd.Timedelta('1s')
        print("unix: ",unix)
        historicalData.append({"success":True,"date": unix, "price": close, "type": "history"})
    
    yield "data: " + json.dumps({"type":"progress", "progress":"0.55"})+"\n\n"
    
    print("historical: ",historicalData)

    trained_models = train_models(algorithms, x_data, y_data)

    yield "data: " + json.dumps({"type":"progress", "progress":"0.85"})+"\n\n"

    predictions = predict_next_stock(trained_models, latest_x_data)
    yield "data: " + json.dumps({"type":"progress", "progress":"0.95"})+"\n\n"
    print(predictions)

    print('latest data: ',latest_data)
    print('latest preprocessed data: ',latest_x_data)

    

    print("\n\n\n\n\n\n\n\n\n\n\ndata",historicalData)

    formatted_predictions = {}
    for model, prediction in predictions.items():
        formatted_predictions[model] = np.reshape(prediction, (1,))[0]

    print("formatted predictions: ",formatted_predictions)

    yield "data: " + json.dumps({'type':'done', 'stock_symbol': stock_symbol, 'history': historicalData, 'data': formatted_predictions})+"\n\n"

@app.route("/get_stock_data", methods=["GET"])
def get_stock_data():
    return Response(predict(request.args.get("stock")), mimetype="text/event-stream")

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5050)