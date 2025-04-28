const sanitizeBody = (body, allowedFields) => {
  const sanitizedBody = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      sanitizedBody[field] = body[field];
    }
  }
  return sanitizedBody;
}

module.exports = sanitizeBody;
// This function takes an object and an array of allowed fields, and returns a new object containing only the allowed fields from the original object. It is useful for sanitizing user input before processing or storing it in a database.