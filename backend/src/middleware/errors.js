export class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export function handleError(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message, fields: error.fields });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Send a valid JSON request.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'The request is too large.' });
  }
  console.error('An API request failed.');
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
}
