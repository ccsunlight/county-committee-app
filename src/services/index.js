'use strict';

const invite = require('./invite');
const edGeometry = require('./edGeometry');
const countyCommitteeMember = require('./county-committee-member');
const countyCommittee = require('./county-committee');
const actionLog = require('./action-log');
const glossaryTerm = require('./glossary-term');
const newsLink = require('./news-link');
//const authentication = require('./authentication');
const user = require('./user');
const page = require('./page');
const address = require('./address');
const mongoose = require('mongoose');


module.exports = function() {
 const app = this;
 const apiPath = app.get('apiPath');

 mongoose.connect(app.get('mongodb'));
 mongoose.Promise = global.Promise;

 // app.configure(authentication);
 
 app.configure(user);
 app.configure(page);
 app.configure(countyCommitteeMember);
 app.configure(countyCommittee);
 app.configure(edGeometry);
 app.configure(invite);
 app.configure(actionLog);
 app.configure(glossaryTerm);
 app.configure(newsLink);
 app.configure(address);

 
    address.docs = {
        description: 'A service to send and receive messages',
        definitions: {
            messages: {
                "type": "object",
                "required": [
                    "text"
                ],
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "The message text"
                    },
                    "useId": {
                        "type": "string",
                        "description": "The id of the user that sent the message"
                    }
                }
            }
        }
    };



 //
 // Workaroud for disabling docs paths for admin entities.
 // https://github.com/feathersjs-ecosystem/feathers-swagger/issues/54
 // @todo handle this more gracefully.
 // 
 delete app.docs.paths[apiPath + '/user'];
 delete app.docs.paths[apiPath + '/user/{_id}'];
 delete app.docs.paths[apiPath + '/invite'];
 delete app.docs.paths[apiPath + '/invite/{_id}'];
 delete app.docs.paths[apiPath + '/action-log'];
 delete app.docs.paths[apiPath + '/action-log/{_id}'];
 delete app.docs.paths[apiPath + '/profile'];
 delete app.docs.paths[apiPath + '/profile/{_id}'];

};


