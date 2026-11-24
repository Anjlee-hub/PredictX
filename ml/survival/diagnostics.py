
from pathlib import Path

import pandas as pd
from lifelines import CoxPHFitter

from ml.survival.train_cox import (
    load_data,
    prepare_features,
    PENALIZER,
    TARGET_COLUMNS,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]

ARTIFACT_DIR = (
    PROJECT_ROOT / "ml" / "artifacts" / "survival"
)


def run_ph_diagnostics():
    train_df, _ = load_data()

    X_train, _, _, feature_columns = prepare_features(
        train_df,
        train_df,
    )

    model_df = pd.concat(
        [
            train_df[["duration", "event"]].reset_index(drop=True),
            X_train.reset_index(drop=True),
        ],
        axis=1,
    )

    model = CoxPHFitter(
        penalizer=PENALIZER,
        l1_ratio=0.0,
    )

    model.fit(
        model_df,
        duration_col="duration",
        event_col="event",
        show_progress=False,
    )

    print("\n--- Proportional Hazards Diagnostics ---")

    model.check_assumptions(
        model_df,
        p_value_threshold=0.05,
        show_plots=False,
    )

    print("\n--- Coefficient Summary ---")
    print(
        model.summary[
            ["coef", "exp(coef)", "p"]
        ].sort_values(
            "p",
            ascending=True,
        )
    )

    print("\nDiagnostic interpretation:")
    print(
        "A low Schoenfeld-residual test p-value can indicate "
        "a violation of the proportional-hazards assumption."
    )
    print(
        "A non-significant result does not prove the assumption "
        "is satisfied, particularly with a small sample."
    )


if __name__ == "__main__":
    run_ph_diagnostics()
