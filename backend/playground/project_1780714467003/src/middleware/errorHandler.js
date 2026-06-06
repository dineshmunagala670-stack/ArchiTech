exports.notFound = (req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
};

exports.globalErrorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
};