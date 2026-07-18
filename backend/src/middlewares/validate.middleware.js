// Validate a request part (body by default) against a Zod schema.
module.exports = function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.validated = result.data;
    return next();
  };
};
