
import json

import joblib

from ml.survival.train_cox import (
    MODEL_PATH,
    SCALER_PATH,
    METRICS_PATH,
    train,
)


def test_cox_training():
    model, metrics = train()

    assert MODEL_PATH.exists()
    assert SCALER_PATH.exists()
    assert METRICS_PATH.exists()

    assert model.params_.notna().all()
    assert len(model.params_) == 20

    assert 0 <= metrics["train_concordance_index"] <= 1
    assert 0 <= metrics["test_concordance_index"] <= 1

    loaded_model = joblib.load(MODEL_PATH)
    loaded_scaler = joblib.load(SCALER_PATH)

    assert len(loaded_model.params_) == 20
    assert len(loaded_scaler.mean_) == 20

    with open(METRICS_PATH, encoding="utf-8") as file:
        saved_metrics = json.load(file)

    assert saved_metrics["model"] == "Cox Proportional Hazards"
