const cache = require('../../utils/cache');
const { getAirtableRecord } = require('../../utils/airtable');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Retrieve the dynamic parameter from the query
  const { redemptionCode } = req.query;

  // Attempt to retrieve cached data
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
    if (records && records.length > 0) {
      const record = records[0];
      const result = {
        redemptionCode: record.get('Redemption Code'),
        establishmentName: record.get('Official Establishment Name'),
        establishmentType: record.get('Establishment Type'),
        awardLevel: record.get('Award Level'),
        redemptionStatus: record.get("Redemption Status"),
      };

      // Cache the result
      cache.set(redemptionCode, result);
      return res.json(result);
    } else {
      return res.status(404).json({ error: 'Sorry, this redemption code is not valid' });
    }
  } catch (error) {
    console.error('Error fetching redemption code status:', error);
    return res.status(500).json({ error: 'Failed to retrieve redemption code status' });
  }
};