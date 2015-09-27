var utils = require('../../src/app/utils');

describe('utils#capizalizeFirstLetter', function() {
    it('should work', function() {
        utils.capizalizeFirstLetter('this').should.eql('This');
        utils.capizalizeFirstLetter('That').should.eql('That');
        utils.capizalizeFirstLetter('those though').should.eql('Those though');
    });
});
