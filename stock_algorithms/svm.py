from sklearn.model_selection import GridSearchCV
from sklearn.svm import SVR

def train_svm_model( x_train, x_test, y_train, y_test):
    param_grid = {'C': [0.1, 1, 10, 100, 1000], 'gamma': ['scale', 'auto'], "kernel": ["rbf"]}
    grid_search = GridSearchCV(estimator=SVR(verbose=2), param_grid=param_grid, cv=5)
    grid_search.fit(x_train, y_train.to_numpy().ravel())

    best_param = grid_search.best_params_
    print("Best Parameters: ", best_param)
    
    best_model = grid_search.best_estimator_
    return best_model
