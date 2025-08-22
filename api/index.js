// Vercel serverless function entry point
const app = require('../backend/server.js');

// Export the Express app as a serverless function
module.exports = (req, res) => {
  return app(req, res);
};
