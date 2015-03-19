var config = require('../lib/config'),
    Helpers = require('../lib/helpers'),
    assert = require('chai').assert;

// METHOD
var method = 'eth_getCode';


// TEST
var asyncTest = function(host, done, params, expectedResult){
    Helpers.send(host, {
        id: config.rpcMessageId++, jsonrpc: "2.0", method: method,
        
        // PARAMETERS
        params: params

    }, function(result, status) {

        
        assert.equal(status, 200, 'has status code');
        assert.property(result, 'result', (result.error) ? result.error.message : 'error');
        assert.isString(result.result, 'is string');
        assert.match(result.result, /^0x/, 'is hex');

        assert.equal(result.result, expectedResult, 'should be '+ expectedResult);

        done();
    });
};


var asyncErrorTest = function(host, done){
    Helpers.send(host, {
        id: config.rpcMessageId++, jsonrpc: "2.0", method: method,
        
        // PARAMETERS
        params: []

    }, function(result, status) {

        assert.equal(status, 200, 'has status code');
        assert.property(result, 'error');
        assert.equal(result.error.code, -32602);

        done();
    });
};



describe(method, function(){

    Helpers.eachHost(function(key, host){
        describe(key, function(){
            it('should return the code when defaultBlock is "latest"', function(done){
                asyncTest(host, done, ['0x6295ee1b4f6dd65047762f924ecd367c17eabf8f', 'latest'], config.testBlocks.postState['6295ee1b4f6dd65047762f924ecd367c17eabf8f'].code);
            });

            it('should return the code when defaultBlock is "latest"', function(done){
                asyncTest(host, done, ['0xec0e71ad0a90ffe1909d27dac207f7680abba42d', 'latest'], config.testBlocks.postState['ec0e71ad0a90ffe1909d27dac207f7680abba42d'].code);
            });
            it('should return nothing as there is no code at block 0', function(done){
                asyncTest(host, done, ['0xec0e71ad0a90ffe1909d27dac207f7680abba42d', '0x0'], '0x00');
            });
            it('should return null as there is no code at this address', function(done){
                asyncTest(host, done, ['0xbcde5374fce5edbc8e2a8697c15331677e6ebf0b', 'latest'], '0x00');
            });

            it('should return an error when no parameter is passed', function(done){
                asyncErrorTest(host, done);
            });
        });
    });
});
