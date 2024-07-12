# Stock Prediction using Python

This repository provides a Python-based approach to predict stock prices using various machine learning techniques. The goal is to build and evaluate models that can forecast future stock prices based on historical data.

## Table of Contents
- [Methodology](#Methodology)
- [Installation](#installation)
- [Data Collection](#data-collection)
- [Data Preprocessing](#data-preprocessing)
- [Modeling](#modeling)
- [Evaluation](#evaluation)
- [Usage](#usage)
- [License](#license)


## Methodology

The methodology for predicting stock prices using machine learning involves several critical steps, from data collection and preprocessing to model training and evaluation. This approach is informed by the methodologies presented in the following research papers:

* Research Paper #1: [Ensemble Methods](https://www.sciencedirect.com/science/article/pii/S1877050920307924)
* Research Paper #2: [Support Vector Machine Method](https://scholarworks.lib.csusb.edu/cgi/viewcontent.cgi?article=1435&context=jitim)

## Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/Michael-RDev/StockPrediction.git
    cd StockPrediction
    ```
2. **Create a virtual environment** 
    * On Windows:
         ```bash
          python3 -m venv venv
         .venv/Scripts/activate
      ```
    * On macOS/Linux:
      ```bash
      python3 -m venv venv
      source venv/bin/activate
      ```
    
3. **Install required dependencies**
    ```bash
    pip install -r requirements.txt
    ```


## Data Collection

The data used for stock prediction can be collected from various sources such as:
- Yahoo Finance
- Nasdaq API

## Data Preprocessing

Before training the models, the collected data needs to be preprocessed. The steps involved include:
- Handling missing values
- Normalizing/Scaling features
- Creating additional features such as moving averages, RSI, etc.
- Splitting the data into training and testing sets

  ## Modeling

Several machine learning models are implemented to predict stock prices. These include:
- Linear Regression
- Support Vector Machines (SVM)
- Random Forest

## Evaluation

The models are evaluated using metrics such as:
- Mean Squared Error (MSE)
- HyperTuning Parameters using a Grid Search to find optimal parameters

  ## Usage

To train and evaluate the models, follow these steps:

1. **Activate the virtual environment**
    * On Windows:
      ```bash
      .\venv\Scripts\activate
      ```
    * On macOS/Linux:
      ```bash
      source venv/bin/activate
      ```

2. **Run the main script**
    ```bash
    python server.py
    ```


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
