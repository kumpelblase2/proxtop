var utils = require('../../src/main/app/util/utils');
var should = require('chai').should();
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('utils#capizalizeFirstLetter', () => {
    it('should work', () => {
        utils.capizalizeFirstLetter('this').should.eql('This');
        utils.capizalizeFirstLetter('That').should.eql('That');
        utils.capizalizeFirstLetter('those though').should.eql('Those though');
    });
});

describe('utils#findLatestRelease', () => {
    it('should get the latest release', () => {
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

    it('should not find a new release if current is latest', () => {
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
            }
        ];
        if(utils.findLatestRelease(normalReleases, '1.1.0')) {
            should.fail('something', 'not existent');
        }
    });

    it('should ignore prereleases and drafts', () => {
        var newest = {
            tag_name: 'v1.1.0',
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
                tag_name: 'v1.2.0',
                published_at: 2,
                prerelease: true,
                draft: false
            },
            {
                tag_name: 'v1.2.0',
                published_at: 2,
                prerelease: false,
                draft: true
            },
            {
                tag_name: 'v1.2.0',
                published_at: 2,
                prerelease: true,
                draft: true
            },
            newest
        ];

        if(utils.findLatestRelease(normalReleases, '1.1.0')) {
            should.fail('something', 'not existent');
        }
        utils.findLatestRelease(normalReleases).should.eql(newest);
        utils.findLatestRelease(normalReleases, '1.0.0').should.eql(newest);
    });
});

describe('utils#createIfNotExists', () => {
    const FILE = path.join(os.tmpdir(), "proxtop_temp_file");

    it('should create the file if it doesn\'t exist', (done) => {
        utils.createIfNotExists(FILE).then(() => fs.unlinkSync(FILE)).should.be.fulfilled.and.notify(done);
    });

    it('should do nothing if the file already exists', (done) => {
        fs.writeFileSync(FILE, "");
        utils.createIfNotExists(FILE).then(() => fs.unlinkSync(FILE)).should.be.fulfilled.and.notify(done);
    })
});

describe('utils#createDirIfNotExists', () => {
    const DIR = path.join(os.tmpdir(), "proxtop_temp_dir");

    it('should create the directory if it doesn\'t exist', () => {
        utils.createDirIfNotExists(DIR);
        fs.rmdirSync(DIR);
    });

    it('should do nothing if the directory already exists', () => {
        fs.mkdirSync(DIR);
        utils.createIfNotExists(DIR);
        fs.rmdirSync(DIR);
    })
});
