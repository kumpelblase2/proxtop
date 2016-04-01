var utils = require('../../src/app/proxerapi/page_utils');
var os = require('os');

describe('page_utils#getHeaders', function() {
    it('should get the correct user agent', function() {
        utils.getHeaders('1.1.0').should.have.property('User-Agent');
        utils.getHeaders('1.1.0')['User-Agent'].should.include('Proxtop/1.1.0');
    });

    it('should get the default if the custom is disabled', function() {
        utils.getHeaders('1.1.0', true, os.platform(), os.release()).should.have.property('User-Agent');
        utils.getHeaders('1.1.0', true, os.platform(), os.release())['User-Agent'].should.not.include('Proxtop');
        utils.getHeaders('1.1.0', true, os.platform(), os.release())['User-Agent'].should.include('Chrome');
    });

    it('should include the current OS', function() {
        utils.getHeaders('1.1.0', true, 'win32', '10.0.1').should.have.property('User-Agent');
        utils.getHeaders('1.1.0', true, 'win32', '10.0.1')['User-Agent'].should.include('Windows NT 6.2');
        utils.getHeaders('1.1.0', true, 'win32', '10.0.1')['User-Agent'].should.not.include('Linux');
        utils.getHeaders('1.1.0', true, 'win32', '10.0.1')['User-Agent'].should.not.include('Mac');

        utils.getHeaders('1.1.0', true, 'darwin', '10_11_3').should.have.property('User-Agent');
        utils.getHeaders('1.1.0', true, 'darwin', '10_11_3')['User-Agent'].should.include('Mac OS X 10_11_3');
        utils.getHeaders('1.1.0', true, 'darwin', '10_11_3')['User-Agent'].should.not.include('Linux');
        utils.getHeaders('1.1.0', true, 'darwin', '10_11_3')['User-Agent'].should.not.include('Windows');
    });
});
