from sklearn.model_selection import GridSearchCV
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

def linear_model(x_train,x_test, y_train,y_test):
    param_grid = {
        "n_jobs": [5, 10 , 20, 50],
        "fit_intercept": [True, False],
        "copy_X": [False, True],
        "positive": [False, True]
    }
    grid_search = GridSearchCV(estimator=LinearRegression(), param_grid=param_grid, cv=5, verbose=1)
    grid_search.fit(x_train.values, y_train.values)
    print("Best Linear Paramaeters: ", grid_search.best_params_)
    best_rf_model = grid_search.best_estimator_
    predictions = best_rf_model.predict(x_test)

    mse = mean_squared_error(y_test, predictions)
    print("Mean Squared Error:", mse)
    return best_rf_model

