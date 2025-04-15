import os
from io import BytesIO
import math
import random
import warnings
import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import statsmodels.api as sm
import xgboost as xgb

from sklearn.model_selection import train_test_split, KFold
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectKBest, f_regression

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from datetime import datetime

warnings.filterwarnings("ignore")

# Import additional models for extended support
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor

# Importing actualTest function from API.py (for the /upload endpoint, which remains unchanged)
from API import actualTest

app = Flask(__name__)
CORS(
    app,
    origins=["http://localhost:3030"],
    methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],  # Added Authorization
    expose_headers=["Authorization"],
    max_age=600,
    supports_credentials=True,  # Required for session cookies if used
)

# Feature and target columns
FEATURE_COLUMNS = ["radiation", "rain", "avg_max_temp", "avg_min_temp"]
TARGET_COLUMN = "yield"

# Base directory to store models
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# Global variable to hold the model
model = None


def load_latest_model_by_type(model_type):
    """
    Load the latest model file of the specified model_type from the subfolder in MODEL_DIR.
    Assumes filenames follow the format: <model_type>_model_<timestamp>.pkl.
    """
    subfolder = os.path.join(MODEL_DIR, model_type)
    if not os.path.exists(subfolder):
        return None
    model_files = [f for f in os.listdir(subfolder) if f.endswith(".pkl")]
    if not model_files:
        return None
    # Lexicographical sorting works because the timestamp is in YYYYMMDD_HHMMSS format.
    model_files = sorted(model_files, reverse=True)
    latest_model_path = os.path.join(subfolder, model_files[0])
    loaded_model = joblib.load(latest_model_path)
    print(f"Loaded latest {model_type} model: {latest_model_path}")
    return loaded_model


def load_latest_model():
    """
    Fallback to load the latest base model.
    Here we assume 'xgb' is the base model type.
    """
    return load_latest_model_by_type("xgb")


@app.before_request
def log_request_info():
    app.logger.debug("\n\n══════════════════════════════════════")
    app.logger.debug(f"Incoming Request: {request.method} {request.url}")
    app.logger.debug("Headers: %s", dict(request.headers))
    app.logger.debug("Files: %s", list(request.files.keys()))
    app.logger.debug("Form: %s", dict(request.form))


@app.route("/test", methods=["GET"])
def sayHello():
    return "Hello! I'm up and running"


@app.route("/models", methods=["GET"])
def list_models():
    """
    List all available models grouped by model type.
    The response is a dictionary with keys as model types and values as lists of model filenames.
    """
    models_dict = {}
    try:
        # Loop over each subfolder in the MODEL_DIR
        for subfolder in os.listdir(MODEL_DIR):
            subfolder_path = os.path.join(MODEL_DIR, subfolder)
            if os.path.isdir(subfolder_path):
                model_files = [
                    f for f in os.listdir(subfolder_path) if f.endswith(".pkl")
                ]
                models_dict[subfolder] = sorted(model_files)
        return jsonify({"models": models_dict}), 200
    except Exception as e:
        return jsonify({"error": f"Error listing models: {str(e)}"}), 500


# ---------- /train Endpoint ----------
@app.route("/train", methods=["POST"])
def train_model():
    training_file = request.files.get("training_file")
    if not training_file:
        return jsonify({"error": "No training file provided."}), 400

    model_type = request.args.get("model_type", "xgb").lower()

    try:
        if training_file.filename.endswith(".xlsx"):
            training_df = pd.read_excel(training_file)
        else:
            training_df = pd.read_csv(training_file, encoding="latin1")

        COLUMN_MAPPING = {
            "Total Radiation": "radiation",
            "Total Rainfall": "rain",
            "Avg Max Temperature": "avg_max_temp",
            "Avg Min Temperature": "avg_min_temp",
            "Yield (tons/acre)": "yield",
        }
        training_df.rename(columns=COLUMN_MAPPING, inplace=True)
        X = training_df[FEATURE_COLUMNS]
        y = training_df[TARGET_COLUMN]

        # Train model
        if model_type == "xgb":
            model = xgb.XGBRegressor(
                objective="reg:squarederror", n_estimators=100, random_state=42
            )
        elif model_type == "random_forest":
            model = RandomForestRegressor(n_estimators=100, random_state=42)
        elif model_type == "decision_tree":
            model = DecisionTreeRegressor(max_depth=10, random_state=42)
        else:
            return jsonify({"error": f"Unsupported model type: {model_type}"}), 400

        model.fit(X, y)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        model_filename = f"{model_type}_model_{timestamp}.pkl"
        buffer = BytesIO()
        joblib.dump(model, buffer)
        buffer.seek(0)

        response = Response(
            buffer.getvalue(),
            mimetype="application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{model_filename}"',
                "X-Model-Filename": model_filename,
            },
        )

        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------- /upload Endpoint (Unchanged) ----------
@app.route("/upload", methods=["POST"])
def upload_and_predict():
    if request.method == "POST":
        target_file = request.files["target_file"]
        target_df = pd.read_csv(target_file)
        boost_file = request.files["boost_file"]
        boost_df = pd.read_csv(boost_file)
        all_years_file = request.files["all_years_file"]
        all_years_df = pd.read_csv(all_years_file)
        final_year_file = request.files["final_year_file"]
        final_year_df = pd.read_csv(final_year_file)
        target_year_file = request.files["target_year_file"]
        target_year_df = pd.read_csv(target_year_file)

        test_x_df = target_df[FEATURE_COLUMNS].reset_index(drop=True)
        boost_x_df = boost_df[FEATURE_COLUMNS].reset_index(drop=True)
        test_y_df = target_df[[TARGET_COLUMN]].reset_index(drop=True)
        boost_y_df = boost_df[[TARGET_COLUMN]].reset_index(drop=True)

        model = joblib.load("xgbTup_070923_2.pkl")
        if isinstance(model, tuple):
            model = model[0]

        result = actualTest(
            all_years_df,
            final_year_df,
            target_year_df,
            boost_x_df,
            boost_y_df,
            test_x_df,
            test_y_df,
            model,
        )

        (
            adj_pred,
            mean_absolute_error,
            r,
            mape,
            smape,
            mae,
            mse,
            rmse,
            adj_pred_df,
            pred_ts,
            all_years_data,
        ) = result

        response_data = {
            "adjusted_predictions": adj_pred,
            "mean_absolute_error": mean_absolute_error,
            "r": r,
            "mape": mape,
            "smape": smape,
            "mae": mae,
            "mse": mse,
            "rmse": rmse,
            "all_years_data": all_years_data.to_dict(orient="records"),
            "prediction_timestamps": pred_ts,
        }

        return jsonify(response_data)


# ---------- /predict Endpoint ----------
@app.route("/predict", methods=["POST"])
def predict():
    """
    Make predictions using a model file provided in the request.
    Expects two files in the request:
    - model_file: The serialized model file (.pkl)
    - test_file: The test data file (CSV or Excel)
    """
    try:
        # Get files from request
        model_file = request.files.get("model_file")
        test_file = request.files.get("test_file")

        if not model_file:
            return jsonify({"error": "No model file provided"}), 400
        if not test_file:
            return jsonify({"error": "No test file provided"}), 400

        # Load model directly from uploaded file
        model = joblib.load(model_file)

        # Handle tuple-wrapped models (if your training code stores models as tuples)
        if isinstance(model, tuple):
            model = model[0]

        # Process test data
        if test_file.filename.endswith(".xlsx"):
            test_df = pd.read_excel(test_file)
        else:
            test_df = pd.read_csv(test_file)

        # Apply consistent column naming
        COLUMN_MAPPING = {
            "Total Radiation": "radiation",
            "Total Rainfall": "rain",
            "Avg Max Temperature": "avg_max_temp",
            "Avg Min Temperature": "avg_min_temp",
        }
        test_df.rename(columns=COLUMN_MAPPING, inplace=True)

        # Validate required features
        missing_columns = [col for col in FEATURE_COLUMNS if col not in test_df.columns]
        if missing_columns:
            return (
                jsonify({"error": f"Missing required columns: {missing_columns}"}),
                400,
            )

        # Generate predictions
        predictions = model.predict(test_df[FEATURE_COLUMNS])
        test_df["Predicted Yield"] = predictions

        return jsonify(
            {
                "predictions": test_df.to_dict(orient="records"),
                "features_used": FEATURE_COLUMNS,
                "prediction_count": len(predictions),
            }
        )

    except Exception as e:
        app.logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


# ---------------------- Helper Functions ----------------------------


def synthesize_tabular_data(df, samples_out, no_stds=1.5):
    synthetic_data = []
    # Synthesize data only if a 'class' column exists
    if "class" not in df.columns:
        raise Exception("Column 'class' not found in DataFrame for synthesis.")
    for class_label in df["class"].unique():
        subset = df[df["class"] == class_label]
        means = subset.mean()
        stds = subset.std()
        for _ in range(samples_out // len(df["class"].unique())):
            new_sample = {
                col: random.uniform(
                    means[col] - no_stds * stds[col], means[col] + no_stds * stds[col]
                )
                for col in df.columns
                if col != "class"
            }
            new_sample["class"] = class_label
            synthetic_data.append(new_sample)
    return pd.DataFrame(synthetic_data)


def getBestModel(N, xDf, yDf, features):
    # Impute missing values with the column mean
    xDf = xDf.fillna(xDf.mean())
    yDf = yDf.fillna(yDf.mean())

    # Normalize target variable to avoid high MAE
    scaler = StandardScaler()
    yDf_scaled = pd.DataFrame(scaler.fit_transform(yDf), columns=["yield"])

    avgMAE, avgRSq = 0.0, 0.0
    bestRSq, bestMAE = -np.inf, np.inf
    bestModel = None

    # Convert to numpy arrays after imputation
    X, y = xDf.values, yDf_scaled.values.flatten()
    cv = KFold(n_splits=N, random_state=42, shuffle=True)

    for train_index, test_index in cv.split(X):
        xTrain, xTest = X[train_index], X[test_index]
        yTrain, yTest = y[train_index], y[test_index]

        featureSelector = SelectKBest(f_regression, k=features)
        xTrain = featureSelector.fit_transform(xTrain, yTrain)
        xTest = featureSelector.transform(xTest)

        model = xgb.XGBRegressor(
            objective="reg:squarederror",
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42,
        )
        model.fit(xTrain, yTrain)

        yPred = model.predict(xTest)
        mae = mean_absolute_error(yTest, yPred)
        rSq = r2_score(yTest, yPred)

        avgMAE += mae
        avgRSq += rSq

        if rSq > bestRSq:
            bestMAE, bestRSq, bestModel = mae, rSq, model

    return avgMAE / N, avgRSq / N, bestMAE, bestRSq, bestModel, scaler


def run_actual_test_for_api(
    all_yearsDf, final_yearDf, target_yearDf, xTest, yTest, model, scaler
):
    # Predict and reverse normalization
    yPred = model.predict(xTest)
    yPred_original = scaler.inverse_transform(yPred.reshape(-1, 1)).flatten()

    # Align target_yearDf index with the tail of all_yearsDf
    target_yearDf = target_yearDf.copy()
    target_yearDf.index = all_yearsDf.index[-len(target_yearDf) :]

    # Compute adjusted predictions
    adjPred = [
        final_yearDf["yield"].iloc[-1] + yPred_original[i]
        for i in range(len(yPred_original))
    ]
    mae = mean_absolute_error(
        target_yearDf["yield"], pd.DataFrame(adjPred, columns=["yield"])
    )
    if len(target_yearDf["yield"]) > 1:
        r = np.corrcoef(target_yearDf["yield"], adjPred)[0, 1]
    else:
        r = None

    # Instead of plotting with plt.show(), prepare data for the front end
    plot_data = {
        "all_years_index": all_yearsDf.index.tolist(),
        "all_years_yield": all_yearsDf["yield"].tolist(),
        "target_year_index": target_yearDf.index.tolist(),
        "target_year_actual_yield": target_yearDf["yield"].tolist(),
        "adjusted_predictions": adjPred,
    }
    return mae, r, plot_data


# ---------------------- New API Endpoint ----------------------------


@app.route("/run_pipeline", methods=["POST"])
def run_pipeline():
    """
    This endpoint accepts 5 input files from the front end and runs the full ML pipeline in real time.
    Expected files (passed via form-data):
      - boost_file: used as aggregated data (aggDf)
      - all_years_file: used as all_yearsDf (actual yield over time)
      - final_year_file: used as final_yearDf (final year yield)
      - target_file: used as target data for testing (targetDf)
      - target_year_file: used as target_yearDf for testing
    The endpoint synthesizes additional data (if possible), trains an XGBoost model using cross-validation,
    tests the model, and returns key metrics plus the plotting data.
    """
    try:
        # --- Request Validation ---
        if not request.content_type.startswith("multipart/form-data"):
            return jsonify({"error": "Invalid content type. Use form-data"}), 400

        # --- File Validation ---
        required_files = [
            "boost_file",
            "all_years_file",
            "final_year_file",
            "target_file",
            "target_year_file",
        ]
        missing_files = [f for f in required_files if f not in request.files]
        if missing_files:
            return (
                jsonify({"error": "Missing required files", "missing": missing_files}),
                400,
            )

        # --- File Reading with Validation ---
        def read_file(file):
            try:
                if file.filename == "":
                    raise ValueError("Empty filename")

                if file.filename.endswith(".xlsx"):
                    return pd.read_excel(file)
                elif file.filename.endswith(".csv"):
                    return pd.read_csv(file, encoding="latin1")
                else:
                    raise ValueError("Unsupported file type")

            except Exception as e:
                app.logger.error(f"Error reading {file.filename}: {str(e)}")
                raise

        # --- Data Processing with Error Zones ---
        try:
            aggDf = read_file(request.files["boost_file"])
            all_yearsDf = read_file(request.files["all_years_file"])
            final_yearDf = read_file(request.files["final_year_file"])
            targetDf = read_file(request.files["target_file"])
            target_yearDf = read_file(request.files["target_year_file"])
        except Exception as e:
            return jsonify({"error": f"File processing error: {str(e)}"}), 400

        # --- Data Synthesis ---
        try:
            if "class" in aggDf.columns:
                synth_data = synthesize_tabular_data(aggDf, samples_out=5000)
                aggDf = pd.concat([aggDf, synth_data], ignore_index=True)
        except Exception as e:
            app.logger.warning(f"Data synthesis skipped: {str(e)}")

        # --- Model Training ---
        try:
            numFeatures = len(FEATURE_COLUMNS)
            train_result = getBestModel(
                4, aggDf[FEATURE_COLUMNS], aggDf[[TARGET_COLUMN]], numFeatures
            )
            avgMAE, avgRSq, bestMAE, bestRSq, bestModel, scaler = train_result
        except Exception as e:
            app.logger.error(f"Model training failed: {str(e)}")
            return jsonify({"error": f"Model training failed: {str(e)}"}), 500

        # --- Prediction ---
        try:
            test_x = targetDf[FEATURE_COLUMNS].reset_index(drop=True)
            test_y = targetDf[[TARGET_COLUMN]].reset_index(drop=True)

            mae, r, plot_data = run_actual_test_for_api(
                all_yearsDf,
                final_yearDf,
                target_yearDf,
                test_x,
                test_y,
                bestModel,
                scaler,
            )
        except Exception as e:
            app.logger.error(f"Prediction failed: {str(e)}")
            return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

        return (
            jsonify(
                {
                    "avg_mae": avgMAE,
                    "avg_r2": avgRSq,
                    "best_mae": bestMAE,
                    "best_r2": bestRSq,
                    "test_mae": mae,
                    "correlation": r,
                    "plot_data": plot_data,
                }
            ),
            200,
        )

    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


if __name__ == "__main__":
    print("╔══════════════════════════════════════╗")
    print("║      Flask Server Starting...        ║")
    print("╚══════════════════════════════════════╝")
    app.run(host="0.0.0.0", port=5000, debug=True)
