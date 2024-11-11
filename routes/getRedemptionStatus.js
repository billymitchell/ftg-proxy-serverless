const express = require('express');
const router = express.Router();
const cache = require('../utils/cache');
const { getAirtableRecord } = require('../utils/airtable');

router.get('/:redemptionCode', async (req, res) => {
  const { redemptionCode } = req.params;

  // Check cache for user status
  const cachedStatus = cache.get(redemptionCode);
  if (cachedStatus && cachedStatus.status && cachedStatus.status.recordId) {
    return res.json({
      redemptionCode: cachedStatus.redemptionCode,
      establishmentName: cachedStatus.establishmentName,
      establishmentType: cachedStatus.establishmentType,
      awardLevel: cachedStatus.awardLevel,
      redemptionStatus: cachedStatus.redemptionStatus,
    });
  }

  try {
    const records = await getAirtableRecord(redemptionCode);
    if (records.length > 0) {
      const record = records[0];
      const status = record.get('Status');
      const recordId = record.id;

      // Cache the result
      cache.set(redemptionCode, {
        redemptionCode: record.get('Redemption Code'),
        establishmentName: record.get('Official Establishment Name'),
        establishmentType: record.get('Establishment Type'),
        awardLevel: record.get('Award Level'),
        redemptionStatus: record.get("Redemption Status"),
      });

      // Send a response with the required data fields
      res.json({
        redemptionCode: record.get('Redemption Code'),
        establishmentName: record.get('Official Establishment Name'),
        establishmentType: record.get('Establishment Type'),
        awardLevel: record.get('Award Level'),
        redemptionStatus: record.get("Redemption Status"),
      });
    } else {
      res.status(404).json({ error: 'Sorry, this redemption code is not valid' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve redemption code status' });
  }
});

module.exports = router;
