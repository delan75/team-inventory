"""
API Response Utilities

Provides standardized response formats for consistent frontend consumption.

Success Response:
{
    "success": true,
    "data": {...} or [...],
    "message": "Optional success message"
}

Error Response:
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Human readable message",
        "details": {...}  // Optional field-level errors
    }
}

Paginated Response:
{
    "success": true,
    "data": {
        "results": [...],
        "count": 100,
        "next": "url",
        "previous": "url"
    }
}
"""
from rest_framework.response import Response
from rest_framework import status


def success_response(data=None, message=None, status_code=status.HTTP_200_OK):
    """Return a standardized success response."""
    response = {
        'success': True,
        'data': data
    }
    if message:
        response['message'] = message
    return Response(response, status=status_code)


def error_response(code, message, details=None, status_code=status.HTTP_400_BAD_REQUEST):
    """Return a standardized error response."""
    response = {
        'success': False,
        'error': {
            'code': code,
            'message': message
        }
    }
    if details:
        response['error']['details'] = details
    return Response(response, status=status_code)


def created_response(data, message=None):
    """Return a standardized 201 Created response."""
    return success_response(data, message, status.HTTP_201_CREATED)


def validation_error_response(serializer_errors):
    """Convert DRF serializer errors to standardized format."""
    return error_response(
        code='VALIDATION_ERROR',
        message='Invalid input data',
        details=serializer_errors,
        status_code=status.HTTP_400_BAD_REQUEST
    )


def not_found_response(message='Resource not found'):
    """Return a 404 response."""
    return error_response(
        code='NOT_FOUND',
        message=message,
        status_code=status.HTTP_404_NOT_FOUND
    )


def forbidden_response(message='You do not have permission to perform this action'):
    """Return a 403 response."""
    return error_response(
        code='FORBIDDEN',
        message=message,
        status_code=status.HTTP_403_FORBIDDEN
    )


def shop_required_response():
    """Return error when shop context is missing."""
    return error_response(
        code='SHOP_REQUIRED',
        message='Shop context required. Please provide X-Shop-ID header or create a shop first.',
        status_code=status.HTTP_400_BAD_REQUEST
    )
