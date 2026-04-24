from rest_framework.exceptions import ValidationError

class DateRangeValidator:
    """
    Reusable date range validation
    """

    @staticmethod
    def validate(start_date, end_date, *, required=False):
        if required and (not start_date or not end_date):
            raise ValidationError({
                "date": "Both start_date and end_date are required."
            })

        if start_date and not end_date:
            raise ValidationError({
                "end_date": "This field is required when start_date is provided."
            })

        if end_date and not start_date:
            raise ValidationError({
                "start_date": "This field is required when end_date is provided."
            })

        if start_date and end_date and start_date > end_date:
            raise ValidationError({
                "date": "start_date must be before end_date."
            })
        

def require_params(data: dict, *fields):
    """
    Ensures required fields exist in request data.
    Raises ValidationError if any are missing.
    """

    missing = [field for field in fields if field not in data or data[field] is None]

    if missing:
        raise ValidationError({
            "detail": f"Missing required fields: {', '.join(missing)}",
            "code": "MISSING_PARAMETERS",
            "parameters": missing
        })
    
    return {field: data[field] for field in fields} 