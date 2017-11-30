'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const confirm = require('../email-confirm');
const local = require('feathers-authentication-local');
const _hash = require('../hash');

exports.before = {
    all: [
        /* auth.verifyToken(),
        auth.populateUser(),
        auth.restrictToAuthenticated() */
    ],
    find: [],
    get: [],
    create: [function(hook) {

        var generator = require('generate-password');

        var password = generator.generate({
            length: 6,
            numbers: true
        });

        hook.params.password_for_email = password
        return _hash(password).then(function(hashedPassword) {
            hook.data.password = hashedPassword;
            confirm.sendInvite(hook.data, hook.params.password_for_email, function(err, data) {
                if (err) {
                    console.log(err);
                } else {

                }
            });

        });

        
    }],
    update: [],
    patch: [],
    remove: []
};

exports.after = {
    all: [_idToId],
    find: [_idToId],
    get: [_idToId],
    create: [_idToId, globalHooks.logAction],
    update: [_idToId, globalHooks.logAction],
    patch: [_idToId, globalHooks.logAction],
    remove: [_idToId, globalHooks.logAction],
};

function _idToId(hook) {

    if (hook.result) {
        if (hook.result.data) {
            hook.result.data.map(function(record) {
                record.id = record._id;
                return record;
            });
        } else if (hook.result._id) {
            hook.result.id = hook.result._id;
            console.log(hook.result);
        }
    }
}

function _sendConfirmEmail(url) {
    console.log(hook.result);
    confirm.confirmUser(url);
}

function _sendInviteEmail(hook) {

    let newUser = hook.result;

}