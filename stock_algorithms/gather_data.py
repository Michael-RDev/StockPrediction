import pandas as pd
from tqdm import tqdm
import yfinance as yf
import os
import contextlib
import shutil
from os.path import join

#before 9:30am - 4pm - discard day, predict now
#after 9:30am - 4pm - include day, predict tommorow

def read_symbols_data():
    data = pd.read_csv("http://www.nasdaqtrader.com/dynamic/SymDir/nasdaqtraded.txt", sep='|')
    data_clean = data[data['Test Issue'] == 'N']
    symbols = data_clean['NASDAQ Symbol'].tolist()
    return symbols, data_clean

def download_specific_symbols_data(symbols, period):
    os.makedirs('hist', exist_ok=True)
    is_valid = {}

    with open(os.devnull, 'w') as devnull:
        with contextlib.redirect_stdout(devnull):
            for symbol in tqdm(symbols, desc="Collecting"):
                data = yf.download(symbol, period=period)
                if len(data.index) == 0:
                    continue
                is_valid[symbol] = True
                data.to_csv(f'hist/{symbol}.csv')

    valid_symbols = [symbol for symbol in symbols if symbol in is_valid]
    return valid_symbols

def move_symbols_to_directory(symbols, source, dest):
    os.makedirs(dest, exist_ok=True)
    for symbol in symbols:
        filename = f'{symbol}.csv'
        shutil.move(join(source, filename), join(dest, filename))

def check_if_empty(input_path:str):
    if len(os.listdir(input_path)) != 0:
        files = [os.remove(os.path.join(input_path, file)) for file in os.listdir(input_path)]
    os.rmdir(input_path)

def optimize_code_specific_symbols(symbols, period='max'):
    os.makedirs('hist', exist_ok=True)
    
    data_path = "data"
    if os.path.exists(data_path):
        check_if_empty(data_path)

    valid_symbols = download_specific_symbols_data(symbols, period)

    _, data_clean = read_symbols_data()
    valid_data = data_clean[data_clean['NASDAQ Symbol'].isin(valid_symbols)]

    os.makedirs('data', exist_ok=True)

    stocks = valid_data[valid_data['ETF'] == 'N']['NASDAQ Symbol'].tolist()

    move_symbols_to_directory(stocks, "hist", "data")

    os.rmdir('hist')

if __name__ == "__main__":
    specific_symbols = ['LMT']
    optimize_code_specific_symbols(specific_symbols)
