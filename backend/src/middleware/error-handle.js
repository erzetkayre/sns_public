/**
 * Global Error Handling Middleware
 * Must be placed AFTER all routes
 */

export function errorHandler(err, req, res, next) {
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);

  // Prisma error handling (optional but recommended)
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      error: "Duplicate field value"
    });
  }

  // Validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  // Default fallback
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
}