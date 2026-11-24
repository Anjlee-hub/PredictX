
from pathlib import Path

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = PROJECT_ROOT / "ml" / "data" / "raw" / "ai4i2020.csv"
OUTPUT_DIR = PROJECT_ROOT / "ml" / "data" / "processed" / "eda"

TARGET = "Machine failure"

NUMERIC_FEATURES = [
    "Air temperature",
    "Process temperature",
    "Rotational speed",
    "Torque",
    "Tool wear",
]


def load_data() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    if df.empty:
        raise ValueError("Dataset is empty.")

    if TARGET not in df.columns:
        raise ValueError(f"Missing target column: {TARGET}")

    return df


def generate_summary(df: pd.DataFrame) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    report_path = OUTPUT_DIR / "eda_summary.txt"

    with report_path.open("w", encoding="utf-8") as report:
        report.write("PREDICTX - AI4I DATASET EDA\n")
        report.write("=" * 45 + "\n\n")

        report.write(f"Dataset shape: {df.shape}\n")
        report.write(f"Duplicate rows: {df.duplicated().sum()}\n")
        report.write(f"Missing values: {df.isnull().sum().sum()}\n\n")

        report.write("COLUMN DATA TYPES\n")
        report.write(str(df.dtypes))
        report.write("\n\n")

        report.write("NUMERIC FEATURE STATISTICS\n")
        report.write(
            df[NUMERIC_FEATURES].describe().to_string()
        )
        report.write("\n\n")

        report.write("MACHINE FAILURE DISTRIBUTION\n")
        report.write(
            df[TARGET].value_counts().sort_index().to_string()
        )
        report.write("\n\n")

        report.write("FAILURE RATE BY PRODUCT TYPE\n")
        report.write(
            df.groupby("Type", observed=True)[TARGET]
            .agg(["count", "sum", "mean"])
            .to_string()
        )
        report.write("\n")

    print(f"EDA summary saved: {report_path}")


def plot_target_distribution(df: pd.DataFrame) -> None:
    counts = df[TARGET].value_counts().sort_index()

    plt.figure(figsize=(7, 5))
    sns.barplot(
        x=counts.index.astype(str),
        y=counts.values,
    )
    plt.title("Machine Failure Distribution")
    plt.xlabel("Machine Failure (0 = No, 1 = Yes)")
    plt.ylabel("Number of Records")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "failure_distribution.png", dpi=150)
    plt.close()


def plot_feature_distributions(df: pd.DataFrame) -> None:
    fig, axes = plt.subplots(2, 3, figsize=(15, 9))
    axes = axes.flatten()

    for index, feature in enumerate(NUMERIC_FEATURES):
        sns.histplot(
            data=df,
            x=feature,
            kde=True,
            ax=axes[index],
        )
        axes[index].set_title(f"Distribution: {feature}")

    axes[-1].axis("off")

    fig.tight_layout()
    fig.savefig(
        OUTPUT_DIR / "feature_distributions.png",
        dpi=150,
    )
    plt.close(fig)


def plot_correlation_matrix(df: pd.DataFrame) -> None:
    # Exclude failure-mode labels to avoid target leakage.
    columns = NUMERIC_FEATURES + [TARGET]
    correlation = df[columns].corr()

    plt.figure(figsize=(10, 7))
    sns.heatmap(
        correlation,
        annot=True,
        cmap="coolwarm",
        fmt=".2f",
        center=0,
    )
    plt.title("Feature and Target Correlation")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "correlation_matrix.png", dpi=150)
    plt.close()


def plot_failure_rate_by_type(df: pd.DataFrame) -> None:
    failure_rates = (
        df.groupby("Type", observed=True)[TARGET]
        .mean()
        .reset_index()
    )

    plt.figure(figsize=(7, 5))
    sns.barplot(
        data=failure_rates,
        x="Type",
        y=TARGET,
    )
    plt.title("Machine Failure Rate by Product Type")
    plt.xlabel("Product Type")
    plt.ylabel("Failure Rate")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "failure_rate_by_type.png", dpi=150)
    plt.close()


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Loading AI4I dataset...")
    df = load_data()

    print("Generating EDA summary...")
    generate_summary(df)

    print("Generating visualisations...")
    plot_target_distribution(df)
    plot_feature_distributions(df)
    plot_correlation_matrix(df)
    plot_failure_rate_by_type(df)

    print("\nEDA completed successfully.")
    print(f"Output directory: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
