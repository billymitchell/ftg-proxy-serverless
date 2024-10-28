const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(express.json());

// Set up rate limiting for incoming requests
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
});
app.use(limiter);

// Import routes
const getRedemptionStatus = require('./routes/getRedemptionStatus');
const updateRedemptionStatus = require('./routes/updateRedemptionStatus');

// Use the routes
app.use('/api/redemption-code-status', getRedemptionStatus);
app.use('/api/redemption-code-status', updateRedemptionStatus);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
