export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Handle specific error cases
  if (error.response) {
    switch (error.response.status) {
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.response.data?.message || 'An unexpected error occurred.';
    }
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
};

export const handleValidationError = (errors) => {
  return Object.entries(errors).map(([field, message]) => ({
    field,
    message: Array.isArray(message) ? message[0] : message
  }));
}; 