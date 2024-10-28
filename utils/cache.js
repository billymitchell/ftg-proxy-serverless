const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 }); // Cache for 60 seconds

module.exports = cache;
