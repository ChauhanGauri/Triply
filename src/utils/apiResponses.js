exports.successResponse = (res, data, message = "Success") => {
    res.status(200).json({
        status: "success",
        message,
        data
    });
};

exports.errorResponse = (res, error, message = "An error occurred") => {
    res.status(500).json({
        status: "error",
        message,
        error
    });
};

exports.notFoundResponse = (res, message = "Resource not found") => {
    res.status(404).json({
        status: "error",
        message
    });
};

exports.validationErrorResponse = (res, errors) => {
    res.status(400).json({
        status: "error",
        message: "Validation error",
        errors
    });
};