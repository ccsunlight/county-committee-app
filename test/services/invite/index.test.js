'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('invite service', function() {
  it('registered the invites service', () => {
    assert.ok(app.service('invites'));
  });
});
