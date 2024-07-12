import yfinance as yf

latest_data = yf.download('LMT', period='7d')
print(latest_data.to_numpy()[1])