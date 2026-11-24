
import pytest

from ml.classification.predict import (
    FEATURES,
    predict_failure,
    validate_sensor_data,
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


def test_valid_prediction(sample_machine):
    result = predict_failure(sample_machine)

    assert result["prediction"] in (0, 1)
    assert 0 <= result["failure_score"] <= 1
    assert 0 <= result["decision_threshold"] <= 1
    assert result["prediction_label"] in ("failure", "no_failure")
    assert result["model_name"] == "hist_gradient_boosting"
    assert result["model_version"] == "1.0.0"


def test_prediction_label_matches_prediction(sample_machine):
    result = predict_failure(sample_machine)

    expected = "failure" if result["prediction"] == 1 else "no_failure"

    assert result["prediction_label"] == expected


def test_input_is_not_modified(sample_machine):
    original = sample_machine.copy()

    validate_sensor_data(sample_machine)

    assert sample_machine == original


def test_missing_feature_is_rejected(sample_machine):
    sample_machine.pop("Torque")

    with pytest.raises(ValueError, match="Missing sensor fields"):
        validate_sensor_data(sample_machine)


def test_unexpected_feature_is_rejected(sample_machine):
    sample_machine["Unknown"] = 123

    with pytest.raises(ValueError, match="Unexpected sensor fields"):
        validate_sensor_data(sample_machine)


@pytest.mark.parametrize("invalid_type", [
    "X",
    "",
    None,
    123,
    ["L"],
])
def test_invalid_machine_type_is_rejected(sample_machine, invalid_type):
    sample_machine["Type"] = invalid_type

    with pytest.raises(ValueError, match="Type must be one of"):
        validate_sensor_data(sample_machine)


@pytest.mark.parametrize("invalid_value", [
    "invalid",
    None,
    float("nan"),
    float("inf"),
    float("-inf"),
    True,
])
def test_invalid_numeric_values_are_rejected(sample_machine, invalid_value):
    sample_machine["Torque"] = invalid_value

    with pytest.raises(ValueError):
        validate_sensor_data(sample_machine)


def test_all_expected_features_are_present(sample_machine):
    validated = validate_sensor_data(sample_machine)

    assert set(validated.keys()) == set(FEATURES)
