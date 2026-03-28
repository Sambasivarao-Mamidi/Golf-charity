const authValidators = require('./authValidators');
const scoreValidators = require('./scoreValidators');
const charityValidators = require('./charityValidators');
const subscriptionValidators = require('./subscriptionValidators');

module.exports = {
  ...authValidators,
  ...scoreValidators,
  ...charityValidators,
  ...subscriptionValidators
};
