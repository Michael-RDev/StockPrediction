import numpy as np
import joblib
from datetime import datetime, timedelta
import os

sim_days = 30
start_money = 1000
start_stock_price = 465.2300109863281
start_stock_volume = 1508534

rf_model = joblib.load("models/RANDOMFOREST_model.pkl")
svm_model = joblib.load("models/SVMMODEL_model.pkl")
linear_model = joblib.load("models/LINEARREGRESSION_model.pkl")

def brownian_motion(stock_input_money, stock_input_volume, days, input_money, mu=0.1, sigma=15, dt=0.1):
    prices = [stock_input_money]
    volumes = [stock_input_volume]
    dates = [datetime.now()]

    for _ in range(1, days):
        price_today = prices[-1]
        volume_today = volumes[-1]

        dz = np.random.normal(mu * dt, sigma * np.sqrt(dt))
        price_today += dz
        volume_today += np.random.randint(-10000, 10000)

        prices.append(price_today)
        volumes.append(volume_today)
        dates.append(dates[-1] + timedelta(days=1))
    return prices, volumes, dates

def simulate_trading(start_money, start_stocks, simulated_price, simulated_volume, simulated_dates, rf_model, svm_model, linear_model):
    money = start_money
    stocks = start_stocks
    for i in range(len(simulated_dates)):
        feature = np.array([simulated_price[i], simulated_dates[i].month, simulated_dates[i].year, simulated_dates[i].day]).reshape(1, -1)
        
        prediction_rf = rf_model.predict(feature)
        prediction_svm = svm_model.predict(feature)
        prediction_linear = linear_model.predict(feature)
        
        prediction = (prediction_rf + prediction_svm + prediction_linear) / 3
        
        actual_change = (simulated_price[i] - simulated_price[i-1]) / simulated_price[i-1] if i > 0 else 0
        
        if prediction > 0 and actual_change > 0:  # buy stocks and prediction is correct
            stocks_to_buy = int(money / simulated_price[i])
            money -= stocks_to_buy * simulated_price[i]
            stocks += stocks_to_buy
        elif prediction < 0 and actual_change < 0:  # sell stocks and prediction is correct
            money += stocks * simulated_price[i]
            stocks = 0

    final_value = money + stocks * simulated_price[-1]
    return final_value

simulated_price, simulated_volume, simulated_dates = brownian_motion(start_stock_price, start_stock_volume, sim_days, start_money)
final_money = simulate_trading(start_money, 0, simulated_price, simulated_volume, simulated_dates, rf_model, svm_model, linear_model)
print("Final money after simulation:", final_money)
