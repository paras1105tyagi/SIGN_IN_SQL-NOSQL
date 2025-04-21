const crypto = require('crypto');

/**
 * Generate a random token for email verification
 * @returns {string} Random verification token
 */
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate token expiry time (24 hours from now)
 * @returns {Date} Token expiry date
 */
const generateVerificationTokenExpiry = () => {
  return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
};

/**
 * Generate a random token for account deletion confirmation
 * @returns {string} Random deletion token
 */
const generateDeletionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate token expiry time (1 hour from now)
 * @returns {Date} Token expiry date
 */
const generateDeletionTokenExpiry = () => {
  return new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
};

module.exports = {
  generateVerificationToken,
  generateVerificationTokenExpiry,
  generateDeletionToken,
  generateDeletionTokenExpiry
}; 