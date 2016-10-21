'use strict';

require('mocha');
var assert = require('assert');
var snake = require('./');

describe('snake-cli', function() {
  it('should export a function', function() {
    assert.equal(typeof snake, 'function');
  });
});
