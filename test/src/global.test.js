import {APP_DIR, PROXER_BASE_URL,APP_NAME} from "../../src/main/app/globals";
import Log from "../../src/main/app/util/log";

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
        Log.should.be.a('object');
        Log.should.respondTo('log');
        Log.should.respondTo('info');
    });
});
