const cache = require('../utils/cache');
const { updateRedemptionStatusInAirtable } = require('../utils/airtable');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const order = req.body;
    if (!order || !order.line_items || !Array.isArray(order.line_items)) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    const redemptionCodes = [];

    order.line_items.forEach(item => {
      if (item.product_personalizations && Array.isArray(item.product_personalizations)) {
        item.product_personalizations.forEach(personalization => {
          if (personalization.attributes && Array.isArray(personalization.attributes)) {
            personalization.attributes.forEach(attribute => {
              if (attribute.key === 'Redemption Code') {
                console.log('Redemption Code:', attribute.value);
                redemptionCodes.push(attribute.value);
              }
            });
          }
        });
      }
    });

    if (redemptionCodes.length === 0) {
      return res.status(400).json({ error: 'No redemption codes found in order items' });
    }

    for (const redemptionCode of redemptionCodes) {
      console.log('Updating redemption status for code:', redemptionCode);
      await updateRedemptionStatusInAirtable(redemptionCode);
      cache.set(redemptionCode, 'Already Redeemed');
    }

    res.json({ message: 'Redemption statuses updated to "Already Redeemed"' });
  } catch (error) {
    console.error('Error updating redemption statuses:', error);
    res.status(500).json({ error: 'Failed to update redemption statuses' });
  }
};