var utils = require('../../src/app/utils');

describe('utils#capizalizeFirstLetter', function() {
    it('should work', function() {
        utils.capizalizeFirstLetter('this').should.eql('This');
        utils.capizalizeFirstLetter('That').should.eql('That');
        utils.capizalizeFirstLetter('those though').should.eql('Those though');
    });
});

describe('utils#findLatestRelease', function() {
    it('should get the latest release', function() {
        var newest = {
            tag_name: 'v1.2.0',
            published_at: 3,
            prerelease: false,
            draft: false
        };

        var normalReleases = [
            {
                tag_name: 'v1.0.0',
                published_at: 0,
                prerelease: false,
                draft: false
            },
            {
                tag_name: 'v1.1.0',
                published_at: 2,
                prerelease: false,
                draft: false
            },
            newest
        ];

        utils.findLatestRelease(normalReleases).should.eql(newest);
        utils.findLatestRelease(normalReleases, '1.1.0').should.eql(newest);
    });
});
