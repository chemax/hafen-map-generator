let log4js = require('log4js');
let lg = log4js.getLogger();
lg.level = process.env.LOGLEVEL || 'debug';
lg.debug('logger uploaded');
module.exports = lg;