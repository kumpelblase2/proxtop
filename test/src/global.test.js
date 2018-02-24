require('../../src/main/app/global');

describe('global namespace', function() {
    it('should expose the APP_NAME', function() {
        APP_NAME.should.eql('proxtop');
    });

    it('should expose APP_DIR', function() {
        APP_DIR.should.be.a('string');
    });

    it('should expose PROXER_BASE_URL', function() {
        PROXER_BASE_URL.should.be.a('string');
        PROXER_BASE_URL.should.contain("proxer.me");
    });

    it('should expose a logger', function() {
        LOG.should.be.a('object');
        LOG.should.respondTo('log');
        LOG.should.respondTo('info');
    });
});
