const validate = require('./validateRequest');

module.exports = validate({
  name: { type: 'string', required: true, max: 80 },
  slug: { type: 'string', required: true, max: 100 }
});
