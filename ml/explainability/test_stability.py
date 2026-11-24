
from types import SimpleNamespace

import numpy as np
import pandas as pd
import pytest

from ml.explainability import stability
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


def test_stability_uses_held_out_test_data(
    synthetic_dataset,
    monkeypatch,
):
    X, y = synthetic_dataset

    monkeypatch.setattr(
        stability,
        "load_dataset",
        lambda: (X, y),
    )

    actual_test = stability.load_test_data()

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


def test_stability_report_outputs_are_generated(
    synthetic_dataset,
    monkeypatch,
    tmp_path,
):
    X, y = synthetic_dataset

    monkeypatch.setattr(
        stability,
        "load_dataset",
        lambda: (X, y),
    )

    monkeypatch.setattr(
        stability,
        "load_explainer",
        lambda: FakeExplainer(),
    )

    monkeypatch.setattr(
        stability,
        "OUTPUT_DIR",
        tmp_path,
    )

    monkeypatch.setattr(
        stability,
        "SAMPLE_SIZE",
        20,
    )

    monkeypatch.setattr(
        stability,
        "RANDOM_SEEDS",
        [42, 52, 62, 72, 82],
    )

    result = stability.generate_stability_report()

    summary = result["summary"]
    report = result["report"]

    assert report["number_of_runs"] == 5
    assert report["sample_size_per_run"] == 20
    assert report["evaluation_partition"] == "held-out test"

    assert len(result["run_results"]) == 5
    assert len(summary) == len(FEATURES)

    assert summary["feature"].is_unique

    assert summary["mean_absolute_shap"].notna().all()
    assert summary["std_absolute_shap"].notna().all()

    assert np.isfinite(
        summary["mean_absolute_shap"]
    ).all()

    assert np.isfinite(
        summary["std_absolute_shap"]
    ).all()

    assert (
        summary["mean_absolute_shap"] >= 0
    ).all()

    assert (
        summary["std_absolute_shap"] >= 0
    ).all()

    assert summary["overall_rank"].tolist() == list(
        range(1, len(FEATURES) + 1)
    )

    correlation = report[
        "average_pairwise_spearman_correlation"
    ]

    assert correlation is not None
    assert -1 <= correlation <= 1
    assert report["valid_correlation_count"] == 10

    assert result["run_csv"].exists()
    assert result["summary_csv"].exists()
    assert result["report_path"].exists()
    assert result["plot_path"].exists()
