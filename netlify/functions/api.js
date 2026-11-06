const serverless = require('serverless-http');
const app = require('../../app');

// Wrap Express app as a Netlify serverless function.
// Netlify sets event.path to the original request path (e.g. /api/menu),
// so Express routes like app.use('/api/menu', ...) match correctly.
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Keep Lambda/Netlify connection alive between invocations
  context.callbackWaitsForEmptyEventLoop = false;

  // Ensure DB is connected before handling the request
  await app.ensureDB();

  return handler(event, context);
};
