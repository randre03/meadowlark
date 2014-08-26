/**
 * Created by randre03 on 8/25/14.
 */
var fortune = require('../lib/fortune');
var expect = require('chai').expect;

suite('Fortune cookie tests', function() {
    test('getFortune() should return a fortune', function() {
        expect(typeof fortune.getFortune() === 'string');
    });
});