
def validate_sensor_data(data):

    errors = []

    if not data.machine_id.strip():
        errors.append("Machine ID cannot be empty")

    if not 150 <= data.air_temperature <= 400:
        errors.append("Air temperature is outside the accepted range")

    if not 150 <= data.process_temperature <= 500:
        errors.append("Process temperature is outside the accepted range")

    if not 0 < data.rotational_speed <= 10000:
        errors.append("Rotational speed must be between 0 and 10000")

    if not 0 <= data.torque <= 1000:
        errors.append("Torque must be between 0 and 1000")

    if not 0 <= data.tool_wear <= 1000:
        errors.append("Tool wear must be between 0 and 1000")

    return errors
