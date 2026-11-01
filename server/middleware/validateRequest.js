const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (fields) => (req, res, next) => {
  const errors = [];
  for (const [field, rules] of Object.entries(fields)) {
    const value = req.body[field];
    if (rules.required && (typeof value !== 'string' || !value.trim())) {
      errors.push(`${field} is required`);
      continue;
    }
    if (value === undefined || value === null || value === '') continue;
    if (rules.type === 'string' && (typeof value !== 'string' || value.length > (rules.max || 5000))) errors.push(`${field} must be a string no longer than ${rules.max || 5000} characters`);
    if (rules.enum && !rules.enum.includes(value)) errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    if (rules.email && (typeof value !== 'string' || !emailPattern.test(value))) errors.push(`${field} must be a valid email address`);
    if (rules.minLength && typeof value === 'string' && value.trim().length < rules.minLength) errors.push(`${field} must be at least ${rules.minLength} characters`);
    if (rules.type === 'number' && (!Number.isFinite(Number(value)) || Number(value) < 0)) errors.push(`${field} must be a non-negative number`);
  }
  if (errors.length) return res.status(400).json({ message: 'Validation failed', errors });
  next();
};

module.exports = validate;
