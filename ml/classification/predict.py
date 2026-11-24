
from functools import lru_cache
from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

ARTIFACT_DIR = PROJECT_ROOT / "ml" / "artifacts" / "classification"
MODEL_PATH = ARTIFACT_DIR / "selected_model.joblib"
REPORT_PATH = ARTIFACT_DIR / "validation_report.json"

MODEL_NAME = "hist_gradient_boosting"
MODEL_VERSION = "1.0.0"

NUMERIC_FEATURES = [
    "Air temperature",
    "Process temperature",
    "Rotational speed",
    "Torque",
    "Tool wear",
]

CATEGORICAL_FEATURES = ["Type"]
FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES

VALID_TYPES = {"L", "M", "H"}


@lru_cache(maxsize=1)
def load_model():
    """Load the selected model and validation threshold once."""

    if not MODEL_PATH.is_file():
        raise FileNotFoundError(f"Model artifact not found: {MODEL_PATH}")

    if not REPORT_PATH.is_file():
        raise FileNotFoundError(f"Validation report not found: {REPORT_PATH}")

    model = joblib.load(MODEL_PATH)

    with REPORT_PATH.open("r", encoding="utf-8") as file:
        metadata = json.load(file)

    threshold = float(metadata["selected_threshold"])

    if not np.isfinite(threshold) or not 0 <= threshold <= 1:
        raise ValueError("Invalid classification threshold.")

    if not hasattr(model, "predict_proba"):
        raise TypeError("Selected model does not support predict_proba().")

    return model, threshold


def validate_sensor_data(sensor_data):
    """Validate and normalize machine sensor measurements."""

    if not isinstance(sensor_data, dict):
        raise TypeError("Sensor data must be a dictionary.")

    if not all(isinstance(key, str) for key in sensor_data):
        raise ValueError("All sensor field names must be strings.")

    missing = set(FEATURES) - set(sensor_data)
    unexpected = set(sensor_data) - set(FEATURES)

    if missing:
        raise ValueError(f"Missing sensor fields: {sorted(missing)}")

    if unexpected:
        raise ValueError(f"Unexpected sensor fields: {sorted(unexpected)}")

    machine_type = sensor_data["Type"]

    if not isinstance(machine_type, str) or machine_type not in VALID_TYPES:
        raise ValueError("Type must be one of L, M or H.")

    validated = {"Type": machine_type}

    for feature in NUMERIC_FEATURES:
        value = sensor_data[feature]

        if isinstance(value, (bool, np.bool_)):
            raise ValueError(f"{feature} must be numeric, not boolean.")

        try:
            numeric_value = float(value)
        except (TypeError, ValueError, OverflowError):
            raise ValueError(f"{feature} must be numeric.") from None

        if not np.isfinite(numeric_value):
            raise ValueError(f"{feature} must be finite.")

        validated[feature] = numeric_value

    return validated


def predict_failure(sensor_data):
    """
    Predict machine failure.

    failure_score is a model score, not a calibrated
    real-world probability.
    """

    validated_data = validate_sensor_data(sensor_data)

    model, threshold = load_model()

    input_df = pd.DataFrame([validated_data], columns=FEATURES)

    scores = model.predict_proba(input_df)

    if scores.ndim != 2 or scores.shape[1] != 2:
        raise ValueError("Unexpected model probability output shape.")

    failure_score = float(scores[0, 1])

    if not np.isfinite(failure_score) or not 0 <= failure_score <= 1:
        raise ValueError("Model returned an invalid failure score.")

    prediction = int(failure_score >= threshold)

    return {
        "prediction": prediction,
        "prediction_label": "failure" if prediction else "no_failure",
        "failure_score": round(failure_score, 6),
        "decision_threshold": threshold,
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION,
    }
