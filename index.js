const express = require('express');
const rateLimit = require('express-rate-limit');
const Airtable = require('airtable');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(express.json());

// Set up rate limiting for incoming requests
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
});
app.use('/api/user-status', limiter);

// Set up Airtable client
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appC9GXdjmEmFlNk7');
const tableName = 'tblSsW6kAWQd3LZVa';

// In-memory cache for user statuses
const cache = new NodeCache({ stdTTL: 60 }); // Cache for 60 seconds

// Function to fetch user status from Airtable using Redemption Code
async function fetchUserStatusFromAirtable(redemptionCode) {
  return base(tableName)
    .select({
      filterByFormula: `{Redemption Code} = "${redemptionCode}"`,
      maxRecords: 1,
    })
    .firstPage();
}

// Function to update user status in Airtable
async function updateUserStatusInAirtable(recordId, newStatus) {
  return base(tableName).update(recordId, {
    Status: newStatus,
  });
}

// GET request to retrieve user status by Redemption Code
app.get('/api/user-status/:redemptionCode', async (req, res) => {
  const { redemptionCode } = req.params;

  // Check cache for user status
  const cachedStatus = cache.get(redemptionCode);
  if (cachedStatus) {
    return res.json({ status: cachedStatus });
  }

  try {
    const records = await fetchUserStatusFromAirtable(redemptionCode);
    if (records.length > 0) {
      const status = records[0].get('Status');
      const recordId = records[0].id;

      // Cache the result
      cache.set(redemptionCode, { status, recordId });
      res.json({ status });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user status' });
  }
});

// PUT request to update user status by Redemption Code
app.put('/api/user-status/:redemptionCode', async (req, res) => {
  const { redemptionCode } = req.params;
  const { newStatus } = req.body;

  if (!newStatus) {
    return res.status(400).json({ error: 'New status is required' });
  }

  try {
    // Fetch the user record ID from cache or Airtable
    let recordData = cache.get(redemptionCode);

    if (!recordData) {
      const records = await fetchUserStatusFromAirtable(redemptionCode);

      if (records.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      recordData = {
        status: records[0].get('Status'),
        recordId: records[0].id,
      };
      cache.set(redemptionCode, recordData);
    }

    // Update the user status in Airtable
    await updateUserStatusInAirtable(recordData.recordId, newStatus);

    // Update the cache with the new status
    cache.set(redemptionCode, { status: newStatus, recordId: recordData.recordId });

    res.json({ message: 'User status updated successfully', status: newStatus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
