const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 3000;

// Set up CORS to allow requests from both www and non-www versions of the domain
const allowedOriginsRegex = /^https?:\/\/(www\.)?ftg-redemption-test\.mybrightsites\.com$/;

app.use(cors({
  origin: function (origin, callback) {
    // Check if the origin matches the regex or is undefined (for same-origin requests)
    if (allowedOriginsRegex.test(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  // credentials: true, // Enable if cookies are needed for cross-origin requests
}));

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
const receiveOrderData = require('./routes/receiveOrderData');

// Use the routes
app.use('/api/redemption-code-status', getRedemptionStatus);
app.use('/api', receiveOrderData);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
