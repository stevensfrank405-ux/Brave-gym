export function errorHandler(err, req, res, next) {
  console.error("Backend Error:", err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
}
