const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));

    if (process.env.NODE_ENV !== 'production') {
      console.warn('Validation error:', formattedErrors);
    }

    return res.status(422).json({ errors: formattedErrors });
  }
  next();
};
