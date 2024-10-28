const express = require('express');
const router = express.Router();
const cache = require('../utils/cache');
const { fetchUserStatusFromAirtable, updateRedemptionStatusInAirtable } = require('../utils/airtable');

router.patch('/:redemptionCode', async (req, res) => {
  const { redemptionCode } = req.params;

  try {
    let recordData = cache.get(redemptionCode);

    if (!recordData) {
      const records = await fetchUserStatusFromAirtable(redemptionCode);

      if (records.length === 0) {
        return res.status(404).json({ error: 'Redemption code not found' });
      }

      recordData = {
        redemptionStatus: records[0].get('Redemption Status'),
        recordId: records[0].id,
      };
      cache.set(redemptionCode, recordData);
    }

    // Update the redemption status in Airtable
    await updateRedemptionStatusInAirtable(recordData.recordId);

    // Update the cache with the new redemption status
    cache.set(redemptionCode, { redemptionStatus: "Already Redeemed", recordId: recordData.recordId });

    res.json({ message: 'Redemption status updated to "Already Redeemed"' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update redemption status' });
  }
});

module.exports = router;
