
import numpy as np
import pytest

from sklearn.model_selection import train_test_split

from ml.classification.predict import FEATURES
from ml.explainability import explain
from ml.explainability.explain import (
    BACKGROUND_SIZE,
    encode_features,
    explain_failure,
    load_training_background,
)


@pytest.fixture
def sample_machine():
    return {
        "Type": "L",
        "Air temperature": 300.0,
        "Process temperature": 310.0,
        "Rotational speed": 1500,
        "Torque": 40.0,
        "Tool wear": 100,
    }


@pytest.fixture
def explanation(sample_machine):
    return explain_failure(sample_machine)


def test_explanation_returns_expected_fields(explanation):
    expected_fields = {
        "prediction",
        "prediction_label",
        "failure_score",
        "decision_threshold",
        "base_score",
        "model_name",
        "model_version",
        "explanation_status",
        "explanation_error",
        "feature_contributions",
    }

    assert set(explanation.keys()) == expected_fields

    assert explanation["explanation_status"] in {
        "available",
        "unavailable",
    }


def test_explanation_prediction_is_valid(explanation):
    assert explanation["prediction"] in (0, 1)

    expected_label = (
        "failure"
        if explanation["prediction"] == 1
        else "no_failure"
    )

    assert explanation["prediction_label"] == expected_label


def test_explanation_scores_are_valid(explanation):
    assert 0 <= explanation["failure_score"] <= 1
    assert 0 <= explanation["decision_threshold"] <= 1

    if explanation["explanation_status"] == "available":
        assert np.isfinite(explanation["base_score"])
    else:
        assert explanation["base_score"] is None


def test_all_features_are_explained(explanation):
    contributions = explanation["feature_contributions"]

    if explanation["explanation_status"] == "available":
        assert len(contributions) == len(FEATURES)

        explained_features = {
            item["feature"] for item in contributions
        }

        assert explained_features == set(FEATURES)
    else:
        assert contributions == []


def test_contributions_have_valid_structure(explanation):
    valid_effects = {
        "increases_failure_score",
        "decreases_failure_score",
        "neutral",
    }

    for item in explanation["feature_contributions"]:
        assert item["feature"] in FEATURES
        assert "input_value" in item
        assert np.isfinite(item["shap_value"])
        assert item["effect"] in valid_effects


def test_contributions_are_sorted_by_absolute_value(explanation):
    values = [
        abs(item["shap_value"])
        for item in explanation["feature_contributions"]
    ]

    assert values == sorted(values, reverse=True)


def test_shap_additivity(explanation):
    if explanation["explanation_status"] == "available":
        reconstructed_score = (
            explanation["base_score"]
            + sum(
                item["shap_value"]
                for item in explanation["feature_contributions"]
            )
        )

        difference = abs(
            reconstructed_score - explanation["failure_score"]
        )

        assert difference < 1e-5


def test_explanation_does_not_modify_input(sample_machine):
    original = sample_machine.copy()

    explain_failure(sample_machine)

    assert sample_machine == original


def test_invalid_input_is_rejected(sample_machine):
    sample_machine["Type"] = "INVALID"

    with pytest.raises(ValueError):
        explain_failure(sample_machine)


def test_training_background_contains_only_training_records():
    X, y = explain.load_training_background.__globals__[
        "load_dataset"
    ]() if "load_dataset" in explain.load_training_background.__globals__ else (None, None)

    if X is None:
        from ml.preprocessing.preprocess import load_dataset
        X, y = load_dataset()

    expected_train, X_temp, _, y_temp = train_test_split(
        X,
        y,
        test_size=0.30,
        random_state=42,
        stratify=y,
    )

    train_test_split(
        X_temp,
        y_temp,
        test_size=0.50,
        random_state=42,
        stratify=y_temp,
    )

    actual_train = load_training_background()

    assert len(actual_train) == len(expected_train)
    assert actual_train.equals(expected_train)


def test_shap_background_size():
    training_data = load_training_background()

    background = training_data.sample(
        n=min(BACKGROUND_SIZE, len(training_data)),
        random_state=42,
    )

    encoded_background = encode_features(background)

    assert len(encoded_background) == min(
        BACKGROUND_SIZE,
        len(training_data),
    )


def test_prediction_survives_shap_failure(sample_machine, monkeypatch):
    def fail_explainer():
        raise RuntimeError("Simulated SHAP failure")

    monkeypatch.setattr(
        explain,
        "load_explainer",
        fail_explainer,
    )

    result = explain_failure(sample_machine)

    assert result["prediction"] in (0, 1)
    assert 0 <= result["failure_score"] <= 1
    assert result["explanation_status"] == "unavailable"
    assert result["explanation_error"] == "RuntimeError"
    assert result["feature_contributions"] == []
    assert result["base_score"] is None


def test_successful_explanation_has_available_status(sample_machine):
    result = explain_failure(sample_machine)

    assert result["explanation_status"] == "available"
    assert result["explanation_error"] is None
    assert len(result["feature_contributions"]) == len(FEATURES)
    assert result["base_score"] is not None
