const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appC9GXdjmEmFlNk7');
const tableName = 'tblSsW6kAWQd3LZVa';

async function fetchUserStatusFromAirtable(redemptionCode) {
  const records = await base(tableName)
    .select({
      filterByFormula: `{Redemption Code} = "${redemptionCode}"`,
      maxRecords: 1,
    })
    .firstPage();
  return records;
}

async function updateRedemptionStatusInAirtable(recordId) {
  return base(tableName).update(recordId, {
    "Redemption Status": "Already Redeemed",
  });
}

module.exports = {
  fetchUserStatusFromAirtable,
  updateRedemptionStatusInAirtable,
};
