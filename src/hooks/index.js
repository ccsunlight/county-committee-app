'use strict';

// Add any common hooks you want to share across services in here.
// 
// Below is an example of how a hook is written and exported. Please
// see http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.

const winston = require('winston');
require('winston-mongodb');

  const logger = new winston.Logger({
    level: 'info',
    transports: [
      new (winston.transports.Console)({ level: 'info' }),
      new (winston.transports.MongoDB)({db: 'mongodb://172.17.0.2:27017/county-committee', collection: 'action_log'})
    ]
  });




exports.myHook = function(options) {
  return function(hook) {

	logger.info('My custom global hook ran. Feathers is awesome!');

  };
};





exports.logAction = function(hook) {
	logger.info(hook.method, { id: hook.id, path: hook.path});
	//console.log('This hook is logged', hook.method)
};
