require('dotenv').config();
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appC9GXdjmEmFlNk7');
const tableName = 'tblSsW6kAWQd3LZVa';

async function getAirtableRecord(redemptionCode) {
  const record = await base(tableName).select({
      filterByFormula: `{Redemption Code} = "${redemptionCode}"`,
      maxRecords: 1,
  }).firstPage()
  return record;
}

async function updateRedemptionStatusInAirtable(redemptionCode) {
  console.log(redemptionCode);
  const record = await base(tableName).select({
    filterByFormula: `{Redemption Code} = "${redemptionCode}"`,
    maxRecords: 1,
  }).firstPage()
  await base(tableName).update(record[0].id, {
      "Redemption Status": "Already Redeemed",
  });
}

module.exports = {
  getAirtableRecord,
  updateRedemptionStatusInAirtable,
};
