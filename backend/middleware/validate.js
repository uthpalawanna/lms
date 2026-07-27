const { validationResult } = require("express-validator");

// Drop-in "run this after your validation chain" middleware.
// Reused across every route file instead of each one redefining it.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = validate;
