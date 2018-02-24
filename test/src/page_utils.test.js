var utils = require('../../src/main/app/lib/page_utils');
var os = require('os');

describe('page_utils#getHeaders', function() {
    it('should get the default if the custom is disabled', function() {
        utils.getHeaders(true, os.platform(), os.release(), '1.1.0').should.have.property('User-Agent');
        utils.getHeaders(true, os.platform(), os.release(), '1.1.0')['User-Agent'].should.not.include('Proxtop');
        utils.getHeaders(true, os.platform(), os.release(), '1.1.0')['User-Agent'].should.include('Chrome');
    });

    it('should include the current OS', function() {
        utils.getHeaders(true,'win32', '10.0.1', '1.1.0').should.have.property('User-Agent');
        utils.getHeaders(true, 'win32', '10.0.1', '1.1.0')['User-Agent'].should.include('Windows NT 6.2');
        utils.getHeaders(true, 'win32', '10.0.1', '1.1.0')['User-Agent'].should.not.include('Linux');
        utils.getHeaders(true, 'win32', '10.0.1', '1.1.0')['User-Agent'].should.not.include('Mac');

        utils.getHeaders(true, 'darwin', '10_11_3', '1.1.0').should.have.property('User-Agent');
        utils.getHeaders(true, 'darwin', '10_11_3', '1.1.0')['User-Agent'].should.include('Mac OS X 10_11_3');
        utils.getHeaders(true, 'darwin', '10_11_3', '1.1.0')['User-Agent'].should.not.include('Linux');
        utils.getHeaders(true, 'darwin', '10_11_3', '1.1.0')['User-Agent'].should.not.include('Windows');
    });
});
