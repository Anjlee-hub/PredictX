
from types import SimpleNamespace
from backend.services.validation import validate_sensor_data


def test_valid_sensor_data():

    data = SimpleNamespace(
        machine_id="M001",
        air_temperature=298.1,
        process_temperature=308.6,
        rotational_speed=1551,
        torque=42.8,
        tool_wear=50
    )

    errors = validate_sensor_data(data)

    assert errors == []


def test_invalid_air_temperature():

    data = SimpleNamespace(
        machine_id="M001",
        air_temperature=50,
        process_temperature=308.6,
        rotational_speed=1551,
        torque=42.8,
        tool_wear=50
    )

    errors = validate_sensor_data(data)

    assert "Air temperature is outside the accepted range" in errors


def test_empty_machine_id():

    data = SimpleNamespace(
        machine_id="",
        air_temperature=298.1,
        process_temperature=308.6,
        rotational_speed=1551,
        torque=42.8,
        tool_wear=50
    )

    errors = validate_sensor_data(data)

    assert "Machine ID cannot be empty" in errors
