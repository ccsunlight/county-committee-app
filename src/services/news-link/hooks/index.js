'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');


exports.before = {
    all: [],
    find: [],
    get: [],
    create: [function(hook) {

        const ogs = require('open-graph-scraper');
        const options = {
            'url': hook.data.url
        };

        return new Promise(function(fulfill, reject) {
            ogs(options, function(error, results) {
                console.log('error:', error); // This is returns true or false. True if there was a error. The error it self is inside the results object.
                console.log('results:', results);

                if (results.data.ogTitle) {
                    hook.data.title = results.data.ogTitle;
                }

                if (results.data.ogDescription) {
                    hook.data.description = results.data.ogDescription;
                }

                if (results.data.ogImage) {
                    hook.data.image = results.data.ogImage.url;
                }

                if (results.data.ogSiteName) {
                    hook.data.site_name = results.data.ogSiteName;
                }

                console.log('updated hook', hook.data);

                fulfill(hook);
            });
        });

    }],
    update: [function(hook) {
        console.log('hook', hook)
        delete hook.data.updatedAt;
        return hook;
    }],
    patch: [],
    remove: []
};


exports.after = {
    all: [function(hook) {
        if (hook.result.data) {
            hook.result.data.map(function(record) {
                record.id = record._id;
                return record;
            });
        } else {
            console.log(hook.result);
        }
    }],
    find: [function(hook) {
        if (hook.result.data) {
            hook.result.data.map(function(record) {
                record.id = record._id;
                return record;
            });
        } else {
            console.log(hook.result);
        }
    }],
    get: [],
    create: [globalHooks.logAction],
    update: [globalHooks.logAction],
    patch: [globalHooks.logAction],
    remove: [globalHooks.logAction]
};