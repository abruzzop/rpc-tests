var config = require('../lib/config'),
    Helpers = require('../lib/helpers'),
    assert = require('chai').assert;
    _ = require('underscore');

// METHOD
var method = 'eth_getBlockByHash';

// GET BLOCK 5 and 6 as parent
var block = _.find(config.testBlocks.blocks, function(bl, index){
        return (bl.blockHeader.number == 6) ? bl : false;
    }),
    parentBlock = _.find(config.testBlocks.blocks, function(bl, index){
        return (bl.blockHeader.number == 5) ? bl : false;
    });


// TEST
var asyncTest = function(host, done, params, block){

    Helpers.send(host, {
        id: config.rpcMessageId++, jsonrpc: "2.0", method: method,
        
        // PARAMETERS
        params: params

    }, function(result, status) {

        
        assert.equal(status, 200, 'has status code');
        assert.property(result, 'result', (result.error) ? result.error.message : 'error');
        assert.isObject(result.result, 'is object');

        config.blockTest(result.result, block);

        // test for transaction objects
        if(params[1]) {
            _.each(result.result.transactions, function(tx, index){
                config.transactionTest(tx, block.transactions[index], index, block);
            });

        // test for correct transaction hashes
        } else {
            _.each(result.result.transactions, function(tx, index){
                assert.strictEqual(tx, '0x'+ block.transactions[index].hash);
            });
        }

        // test uncles
        if(result.result.uncles) {
            _.each(result.result.uncles, function(uncle, index){
                assert.strictEqual(uncle, '0x'+ block.uncleHeaders[index].hash);
            });
        }

        done();
    });
};


var asyncErrorTest = function(host, done, params){
    Helpers.send(host, {
        id: config.rpcMessageId++, jsonrpc: "2.0", method: method,
        
        // PARAMETERS
        params: params

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
            it('should return a block with the proper structure, containing array of transaction objects', function(done){
                asyncTest(host, done, ['0x'+ block.blockHeader.hash, true], block);
            });

            it('should return a block with the proper structure, containing array of transaction hashes', function(done){
                asyncTest(host, done, ['0x'+ block.blockHeader.hash, false], block);
            });

            it('should return an error when the wrong parameters is passed', function(done){
                asyncErrorTest(host, done, ['0xd2f1575105fd2272914d77355b8dab5afbdde4b012abd849e8b32111be498b0d', true]);
            });
            it('should return an error when the wrong parameters is passed', function(done){
                asyncErrorTest(host, done, ['0xd2f1575105fd2272914d77355b8dab5afbdde4b012abd849e8b32111be498b0d']);
            });
            it('should return an error when no parameter is passed', function(done){
                asyncErrorTest(host, done, []);
            });
        });
    });
});
