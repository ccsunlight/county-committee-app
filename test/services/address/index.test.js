'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('address service', function() {
  it('registered the addresses service', () => {
    assert.ok(app.service('addresses'));
  });
});
