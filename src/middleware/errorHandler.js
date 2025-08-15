// src/middleware/errorHandler.js
export default function errorHandler(err, req, res, next) {
  // Log full stack trace for debugging
  console.error(`[${new Date().toISOString()}]`, err.stack || err);

  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const message = status === 500 
    ? 'Something went wrong on our end.' // Avoid leaking sensitive info
    : err.message || 'Unexpected error occurred.';

  // JSON API errors
  if (req.accepts('json')) {
    return res.status(status).json({
      status,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  // HTML errors — try rendering a nice error page
  res.status(status);
  res.send(`
    <style>
      body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
      h1 { color: #e74c3c; }
      p { color: #555; }
    </style>
    <h1>${status} - ${message}</h1>
    <p>We’re working to fix this issue.</p>
  `);
}
