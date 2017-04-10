'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('edGeometry service', function() {
  it('registered the edGeometries service', () => {
    assert.ok(app.service('edGeometries'));
  });
});
