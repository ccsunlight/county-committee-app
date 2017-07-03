'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const confirm = require('../email-confirm');
const local = require('feathers-authentication-local');

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

        hook.data.password = password;

        hook.params.password_for_email = password

    }, local.hooks.hashPassword(), function(hook) {

        console.log('data', hook.data);
        confirm.sendInvite(hook.data, hook.params.password_for_email, function(err, data) {
            if (err) {
                throw  err;
            }

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
    create: [_idToId, function(hook) {


    }],
    update: [_idToId],
    patch: [_idToId],
    remove: [_idToId],
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