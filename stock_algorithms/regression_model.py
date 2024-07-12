from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import GridSearchCV

def train_rf_regresion(x_train, x_test, y_train, y_test):
    param_grid = {
        'n_estimators': [5, 10, 20, 30],
        'max_depth': [None, 10, 20, 30],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4]
    }

    rf_model = RandomForestRegressor()
    grid_search = GridSearchCV(estimator = rf_model, param_grid = param_grid, 
                            cv = 5, n_jobs = -1, verbose = 2)

    grid_search.fit(x_train.values, y_train.values.ravel())

    best_params = grid_search.best_params_
    print("Best Parameters:", best_params)

    best_rf_model = grid_search.best_estimator_
    predictions = best_rf_model.predict(x_test)

    mse = mean_squared_error(y_test, predictions)
    print("Mean Squared Error:", mse)
    return best_rf_model