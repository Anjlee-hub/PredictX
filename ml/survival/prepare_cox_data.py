
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split


PROJECT_ROOT = Path(__file__).resolve().parents[2]

INPUT_PATH = (
    PROJECT_ROOT
    / "ml"
    / "data"
    / "processed"
    / "cmapss"
    / "fd001_survival_landmark.csv"
)

OUTPUT_DIR = (
    PROJECT_ROOT
    / "ml"
    / "data"
    / "processed"
    / "cmapss"
)

TARGET_COLUMNS = [
    "unit_id",
    "landmark_cycle",
    "duration",
    "event",
]

CORRELATION_THRESHOLD = 0.95


def remove_constant_features(train_features):
    """Remove features with zero variance in training data."""
    return [
        column
        for column in train_features.columns
        if train_features[column].nunique() > 1
    ]


def remove_correlated_features(train_features, threshold=0.95):
    """
    Remove highly correlated features using training data only.

    For each highly correlated pair, retain the first feature
    in the deterministic column ordering.
    """
    correlation = train_features.corr().abs()

    upper_triangle = correlation.where(
        pd.DataFrame(
            True,
            index=correlation.index,
            columns=correlation.columns,
        ).where(
            ~pd.DataFrame(
                False,
                index=correlation.index,
                columns=correlation.columns,
            ),
            False,
        )
    )

    # Select only the upper triangle without the diagonal.
    import numpy as np

    upper_triangle = correlation.where(
        np.triu(
            np.ones(correlation.shape),
            k=1
        ).astype(bool)
    )

    to_drop = [
        column
        for column in upper_triangle.columns
        if (upper_triangle[column] > threshold).any()
    ]

    return [
        column
        for column in train_features.columns
        if column not in to_drop
    ], to_drop


def prepare_cox_data():
    if not INPUT_PATH.exists():
        raise FileNotFoundError(INPUT_PATH)

    data = pd.read_csv(INPUT_PATH)

    features = data.drop(columns=TARGET_COLUMNS)
    targets = data[TARGET_COLUMNS].copy()

    # Split by engine before feature selection.
    X_train, X_test, y_train, y_test = train_test_split(
        features,
        targets,
        test_size=0.20,
        random_state=42,
    )

    # Constant-feature filtering uses training data.
    non_constant = remove_constant_features(X_train)

    X_train = X_train[non_constant]
    X_test = X_test[non_constant]

    # Correlation filtering uses training data only.
    selected_features, removed_correlated = (
        remove_correlated_features(
            X_train,
            threshold=CORRELATION_THRESHOLD,
        )
    )

    X_train = X_train[selected_features]
    X_test = X_test[selected_features]

    train_df = pd.concat(
        [y_train.reset_index(drop=True),
         X_train.reset_index(drop=True)],
        axis=1,
    )

    test_df = pd.concat(
        [y_test.reset_index(drop=True),
         X_test.reset_index(drop=True)],
        axis=1,
    )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    train_path = OUTPUT_DIR / "cox_train.csv"
    test_path = OUTPUT_DIR / "cox_test.csv"

    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)

    print("\n--- Cox PH Data Preparation ---")
    print(f"Original engines: {len(data)}")
    print(f"Training engines: {len(train_df)}")
    print(f"Test engines: {len(test_df)}")

    print(f"\nOriginal candidate features: {features.shape[1]}")
    print(f"After constant removal: {len(non_constant)}")
    print(f"Removed correlated features: {len(removed_correlated)}")
    print(f"Final features: {len(selected_features)}")

    print("\nRemoved correlated features:")
    print(removed_correlated)

    print("\nSelected features:")
    print(selected_features)

    print(f"\nTraining data saved: {train_path}")
    print(f"Test data saved: {test_path}")

    return train_df, test_df


if __name__ == "__main__":
    prepare_cox_data()
