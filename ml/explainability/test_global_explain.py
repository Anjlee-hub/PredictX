
from types import SimpleNamespace

import numpy as np
import pandas as pd
import pytest

from ml.explainability import global_explain
from ml.explainability.explain import FEATURES


@pytest.fixture
def synthetic_dataset():
    row_count = 300

    data = {}

    for index, feature in enumerate(FEATURES):
        if feature == "Type":
            data[feature] = np.resize(
                np.array(["L", "M", "H"]),
                row_count,
            )
        else:
            data[feature] = np.linspace(
                100.0 + index,
                400.0 + index,
                row_count,
            )

    X = pd.DataFrame(data, index=np.arange(1000, 1000 + row_count))

    y = pd.Series(
        np.tile([0, 1], row_count // 2),
        index=X.index,
    )

    return X, y


class FakeExplainer:
    def __call__(self, data, max_evals):
        values = np.tile(
            np.arange(1, len(FEATURES) + 1, dtype=float),
            (len(data), 1),
        )

        return SimpleNamespace(values=values)


def test_global_explanations_use_held_out_test_data(
    synthetic_dataset,
):
    X, y = synthetic_dataset

    global_explain.load_dataset = lambda: (X, y)

    actual_test = global_explain.load_test_data()

    from sklearn.model_selection import train_test_split

    _, X_temp, _, y_temp = train_test_split(
        X,
        y,
        test_size=0.30,
        random_state=42,
        stratify=y,
    )

    _, expected_test, _, _ = train_test_split(
        X_temp,
        y_temp,
        test_size=0.50,
        random_state=42,
        stratify=y_temp,
    )

    assert actual_test.equals(expected_test)

    assert set(actual_test.index).isdisjoint(
        set(X.drop(index=actual_test.index).index)
    )


def test_global_explanation_outputs_are_generated(
    synthetic_dataset,
    monkeypatch,
    tmp_path,
):
    X, y = synthetic_dataset

    monkeypatch.setattr(
        global_explain,
        "load_dataset",
        lambda: (X, y),
    )

    monkeypatch.setattr(
        global_explain,
        "load_explainer",
        lambda: FakeExplainer(),
    )

    monkeypatch.setattr(
        global_explain,
        "OUTPUT_DIR",
        tmp_path,
    )

    monkeypatch.setattr(
        global_explain,
        "SAMPLE_SIZE",
        20,
    )

    monkeypatch.setattr(
        global_explain.shap,
        "summary_plot",
        lambda *args, **kwargs: None,
    )

    result = global_explain.generate_global_explanations()

    importance = result["importance"]

    assert result["sample_size"] == 20
    assert len(importance) == len(FEATURES)

    assert importance["feature"].is_unique
    assert importance["mean_absolute_shap"].notna().all()
    assert importance["mean_shap"].notna().all()

    assert np.isfinite(
        result["shap_values"]
    ).all()

    assert (
        importance["mean_absolute_shap"] >= 0
    ).all()

    assert importance["rank"].tolist() == list(
        range(1, len(FEATURES) + 1)
    )

    assert result["csv_path"].exists()
    assert result["bar_plot_path"].exists()
    assert result["summary_plot_path"].exists()
