
import numpy as np
import pandas as pd
import pytest

from ml.preprocessing.preprocess import prepare_data


@pytest.fixture(scope="module")
def preprocessing_result():
    return prepare_data()


def test_preprocessing_returns_expected_objects(preprocessing_result):
    X_train, X_test, y_train, y_test, preprocessor = preprocessing_result

    assert isinstance(X_train, np.ndarray)
    assert isinstance(X_test, np.ndarray)
    assert isinstance(y_train, pd.Series)
    assert isinstance(y_test, pd.Series)
    assert hasattr(preprocessor, "transformers_")


def test_train_test_data_have_matching_features(preprocessing_result):
    X_train, X_test, _, _, _ = preprocessing_result

    assert X_train.ndim == 2
    assert X_test.ndim == 2
    assert X_train.shape[1] == X_test.shape[1]


def test_preprocessing_produces_nonempty_partitions(preprocessing_result):
    X_train, X_test, y_train, y_test, _ = preprocessing_result

    assert X_train.shape[0] > 0
    assert X_test.shape[0] > 0
    assert len(y_train) == X_train.shape[0]
    assert len(y_test) == X_test.shape[0]


def test_preprocessing_outputs_finite_numeric_values(preprocessing_result):
    X_train, X_test, _, _, _ = preprocessing_result

    assert np.isfinite(X_train).all()
    assert np.isfinite(X_test).all()


def test_preprocessing_preserves_both_target_classes(preprocessing_result):
    _, _, y_train, y_test, _ = preprocessing_result

    assert set(y_train.unique()) == {0, 1}
    assert set(y_test.unique()) == {0, 1}
