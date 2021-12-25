export class HttpError extends Error {
    constructor(message, status = 500, cause) {
        super(message);
        this.status = status;
        this.code = `HTTP_${status}`;
        this.cause = cause;
    }
}
