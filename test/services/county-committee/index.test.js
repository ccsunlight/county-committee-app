'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('county-committee service', function() {
  it('registered the county-committees service', () => {
    assert.ok(app.service('county-committees'));
  });
});
