import os
import pandas as pd
from datetime import datetime, time
import yfinance as yf
from sklearn.model_selection import train_test_split
import joblib

#ALGORITHMS 
# from regression_model import train_rf_regresion
# from svm import train_svm_model
# from linear_regression import linear_model

from stock_algorithms.regression_model import train_rf_regresion
from stock_algorithms.svm import train_svm_model
from stock_algorithms.linear_regression import linear_model

# if time(9, 30) <= datetime.now().time() <= time(16, 0):                                            
#     is_latest = False 
# else:
#     is_latest = True # true if after 4 pm

def preprocess_data(input_data, is_latest:bool, indexing:bool):
    df = pd.DataFrame(input_data)
    target = ["Close"]
    features = ["Volume", "Open", "Month", "Year", "Day"]
    if not indexing:
        df["Date"] = pd.to_datetime(df["Date"])
        df["Month"] = df["Date"].dt.month
        df["Year"] = df["Date"].dt.year
        df["Day"] = df["Date"].dt.day
        df.drop(columns=["Date"], axis=1, inplace=True)
    else:
        df.index = pd.to_datetime(df.index)
        df["Month"] = df.index.month
        df["Year"] = df.index.year
        df["Day"] = df.index.day
    
    if not is_latest or (is_latest and time(9, 30) <= datetime.now().time() <= time(16, 0)):
        print("Between 9 and 4 pm")
        features.remove("Volume")
    
    df.dropna(axis=0, inplace=True)    
    x_data = df[features]
    y_data = df[target]
    return x_data, y_data

def load_data(input_path:str):
    for csv_file in os.listdir(input_path):
        if csv_file.endswith(".csv"):
            return preprocess_data(pd.read_csv(os.path.join(input_path, csv_file)), is_latest=True, indexing=False)

def train_models(selected_algorithms: list, x_data, y_data):
    models = {}
    x_train, x_test, y_train, y_test = train_test_split(x_data, y_data, test_size=0.5, random_state=0)
    algorithm_functions = {
        "RANDOMFOREST": train_rf_regresion, # This works
        "SVMMODEL": train_svm_model, #This works
        "LINEARREGRESSION": linear_model
    }
    for algorithm in selected_algorithms:
        if algorithm in algorithm_functions and algorithm_functions[algorithm] is not None:
            model = algorithm_functions[algorithm](x_train, x_test, y_train, y_test)
            models[algorithm] = model
            # model_file_path = f"models/{algorithm}_model.pkl"
            # os.makedirs(os.path.dirname(model_file_path), exist_ok=True)
            # joblib.dump(model, model_file_path)
        else:
            print(f"Algorithm '{algorithm}' is not supported.")
    return models

def predict_next_stock(input_models: dict, latest_x_data: pd.DataFrame):

    predictions = {}
    for model_name, model in input_models.items():
        if model is not None and model_name == "RANDOMFOREST":
            next_price_prediction = model.predict(latest_x_data)
            predictions[model_name] = next_price_prediction
        if model is not None and model_name == "SVMMODEL":
            next_prediciton = model.predict(latest_x_data)
            predictions[model_name] = next_prediciton
        if model is not None and model_name == "LINEARREGRESSION":
            next_prediciton = model.predict(latest_x_data)
            predictions[model_name] = next_prediciton
    return predictions


if __name__ == "__main__":
    data_path = "data"
    ticker = ["LMT"]


    algorithms = ["RANDOMFOREST", "SVMMODEL", "LINEARREGRESSION"]

    x_data, y_data = load_data(data_path)

    trained_models = train_models(algorithms, x_data, y_data)

    latest_data = yf.download(ticker, period='1d')
    latest_x_data, _ = preprocess_data(latest_data, is_latest=True, indexing=True)

    predictions = predict_next_stock(trained_models, latest_x_data)

    print(predictions)
