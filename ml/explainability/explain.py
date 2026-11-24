
from functools import lru_cache
import logging

import numpy as np
import pandas as pd
import shap

from sklearn.model_selection import train_test_split

from ml.classification.predict import (
    FEATURES,
    load_model,
    validate_sensor_data,
)
from ml.preprocessing.preprocess import load_dataset


logger = logging.getLogger(__name__)

BACKGROUND_SIZE = 50
MAX_EVALS = 100
RANDOM_STATE = 42

TYPE_ENCODING = {
    "L": 0.0,
    "M": 1.0,
    "H": 2.0,
}

TYPE_DECODING = {
    0: "L",
    1: "M",
    2: "H",
}


def encode_features(data):
    """Convert mixed categorical/numerical features into numerical data."""

    encoded = data.copy()

    encoded["Type"] = encoded["Type"].map(TYPE_ENCODING)

    if encoded["Type"].isna().any():
        raise ValueError("Invalid machine Type during SHAP encoding.")

    return encoded[FEATURES].astype(float)


def decode_features(data):
    """Convert SHAP numerical representation into original model inputs."""

    decoded = pd.DataFrame(data, columns=FEATURES)

    decoded["Type"] = (
        decoded["Type"]
        .round()
        .clip(0, 2)
        .astype(int)
        .map(TYPE_DECODING)
    )

    if decoded["Type"].isna().any():
        raise ValueError("Invalid machine Type during SHAP decoding.")

    return decoded[FEATURES]


def load_training_background():
    """
    Reproduce the exact 70/15/15 classification split.

    Only the training partition is eligible for SHAP background sampling.
    Validation and final test records are excluded.
    """

    X, y = load_dataset()

    X_train, X_temp, _, y_temp = train_test_split(
        X,
        y,
        test_size=0.30,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    # Reproduce the validation/test partition.
    # Neither partition is used as SHAP background data.
    train_test_split(
        X_temp,
        y_temp,
        test_size=0.50,
        random_state=RANDOM_STATE,
        stratify=y_temp,
    )

    return X_train


@lru_cache(maxsize=1)
def load_explainer():
    """Create and cache the permutation SHAP explainer."""

    X_train = load_training_background()

    background = X_train.sample(
        n=min(BACKGROUND_SIZE, len(X_train)),
        random_state=RANDOM_STATE,
    )

    encoded_background = encode_features(background)

    model, _ = load_model()

    def predict_failure_score(encoded_data):
        original_data = decode_features(encoded_data)

        return model.predict_proba(original_data)[:, 1]

    explainer = shap.Explainer(
        predict_failure_score,
        encoded_background,
        algorithm="permutation",
    )

    return explainer


def _build_prediction_response(
    prediction,
    failure_score,
    threshold,
):
    """Build a valid prediction response before attempting SHAP."""

    return {
        "prediction": prediction,
        "prediction_label": (
            "failure" if prediction == 1 else "no_failure"
        ),
        "failure_score": round(failure_score, 6),
        "decision_threshold": threshold,
        "model_name": "hist_gradient_boosting",
        "model_version": "1.0.0",
        "explanation_status": "unavailable",
        "explanation_error": None,
        "base_score": None,
        "feature_contributions": [],
    }


def _generate_feature_contributions(
    shap_values,
    validated_data,
):
    """Validate and format local SHAP contributions."""

    contributions = np.asarray(shap_values.values)

    if contributions.ndim == 2:
        contributions = contributions[0]
    elif contributions.ndim != 1:
        raise ValueError(
            "Unexpected SHAP contribution dimensions."
        )

    if len(contributions) != len(FEATURES):
        raise ValueError(
            "SHAP contribution count does not match feature count."
        )

    if not np.all(np.isfinite(contributions)):
        raise ValueError(
            "SHAP returned non-finite contributions."
        )

    feature_explanations = []

    for index, feature in enumerate(FEATURES):
        contribution = float(contributions[index])

        if contribution > 0:
            effect = "increases_failure_score"
        elif contribution < 0:
            effect = "decreases_failure_score"
        else:
            effect = "neutral"

        feature_explanations.append({
            "feature": feature,
            "input_value": validated_data[feature],
            "shap_value": round(contribution, 6),
            "effect": effect,
        })

    feature_explanations.sort(
        key=lambda item: abs(item["shap_value"]),
        reverse=True,
    )

    return feature_explanations


def explain_failure(sensor_data):
    """
    Predict machine failure and optionally explain the prediction.

    Prediction is independent of SHAP execution.

    SHAP values represent model contributions, not causal effects.
    failure_score is not a calibrated real-world probability.

    If SHAP fails, the prediction is still returned with:
        explanation_status = "unavailable"
        feature_contributions = []
        base_score = None
    """

    # 1. Validate incoming sensor data.
    validated_data = validate_sensor_data(sensor_data)

    input_df = pd.DataFrame(
        [validated_data],
        columns=FEATURES,
    )

    # 2. Perform the primary prediction.
    # Model and validation failures intentionally propagate.
    model, threshold = load_model()

    failure_score = float(
        model.predict_proba(input_df)[0, 1]
    )

    if not np.isfinite(failure_score) or not 0 <= failure_score <= 1:
        raise ValueError(
            "Model returned an invalid failure score."
        )

    prediction = int(failure_score >= threshold)

    # 3. Build the prediction response immediately.
    response = _build_prediction_response(
        prediction=prediction,
        failure_score=failure_score,
        threshold=threshold,
    )

    # 4. Attempt optional SHAP explanation.
    try:
        explainer = load_explainer()

        encoded_input = encode_features(input_df)

        shap_values = explainer(
            encoded_input,
            max_evals=MAX_EVALS,
        )

        feature_explanations = _generate_feature_contributions(
            shap_values,
            validated_data,
        )

        base_values = np.asarray(shap_values.base_values)

        if base_values.size == 0:
            raise ValueError("SHAP returned empty base values.")

        base_value = float(base_values.reshape(-1)[0])

        if not np.isfinite(base_value):
            raise ValueError("SHAP returned a non-finite base value.")

        # 5. Mark explanation available only after all checks pass.
        response.update({
            "explanation_status": "available",
            "base_score": round(base_value, 6),
            "feature_contributions": feature_explanations,
        })

    except Exception as exc:
        # Preserve the prediction, but expose the failure status.
        logger.exception(
            "SHAP explanation failed; returning prediction without explanation."
        )

        response["explanation_status"] = "unavailable"
        response["explanation_error"] = type(exc).__name__

    return response
