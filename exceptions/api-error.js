module.exports = class ApiError extends Error {
    constructor(status, message, errors = []) {
      super(message);
      this.status = status;
      this.errors = errors;
    }

    static UnauthorizedError() {
      return new ApiError(401, "Unauthorized user");
    }

    static BadRequest(message, errors = []) {
      return new ApiError(400, message, errors);
    }

    static NotFound(message, errors = []) {
      return new ApiError(404, message, errors);
    }
    // TODO: 405???
    static Forbidden(message, errors = []) {
      return new ApiError(405, message, errors);
    }

    static Conflict(message, errors = []) {
      return new ApiError(409, message, errors);
    }
}