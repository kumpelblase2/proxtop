/*
    Original code made by https://github.com/codemanki/cloudscraper modified to use Promises and fit personal usecase.
 */

const Timeout = 5500; // Cloudflare requires a delay of 5 seconds, so wait for at least 6.
const Promise = require('bluebird');

function Cloudscraper(request) {
    this.request = request;
}

/**
 * Performs get request to url with headers.
 * @param  {String}    url
 */
Cloudscraper.prototype.performRequest = function(url) {
    return this.request.get(url).then(this.handle.bind(this));
};

function checkForErrors(body) {
    // Finding captcha
    if (body.indexOf('why_captcha') !== -1 || /recaptcha/i.test(body)) {
        throw new Error('Detected Captcha');
    }

    // trying to find '<span class="cf-error-code">1006</span>'
    const match = body.match(/<\w+\s+class="cf-error-code">(.*)<\/\w+>/i);

    if (match) {
        throw new Error('unknown cloudflare error ' + match[1]);
    }
}


Cloudscraper.prototype.solveChallenge = function(response, body) {
    let challenge = body.match(/name="jschl_vc" value="(\w+)"/),
        host = response.request.host,
        self = this;

    if (!challenge) {
        throw new Error({errorType: 3, error: 'I cant extract challengeId (jschl_vc) from page', body: body, response: response});
    }

    const jsChlVc = challenge[1];

    challenge = body.match(/getElementById\('cf-content'\)[\s\S]+?setTimeout.+?\r?\n([\s\S]+?a\.value =.+?)\r?\n/i);

    if (!challenge) {
        throw new Error({errorType: 3, error: 'I cant extract method from setTimeOut wrapper', body: body, response: response});
    }

    challenge_pass = body.match(/name="pass" value="(.+?)"/)[1];

    challenge = challenge[1];
    challenge = challenge.replace(/a\.value =(.+?) \+ .+?;/i, '$1');
    challenge = challenge.replace(/\s{3,}[a-z](?: = |\.).+/g, '');

    return Promise.try(function() {
        return {
            'jschl_vc': jsChlVc,
            'jschl_answer': (eval(challenge) + response.request.host.length),
            'pass': challenge_pass
        };
    }).then(function(result) {
        const answerUrl = response.request.uri.protocol + '://' + host + '/cdn-cgi/l/chk_jschl';

        const headers = {
            Referer: response.request.uri.href // Original url should be placed as referer
        };
        LOG.verbose('Solved CloudFlare with ' + result + '. Sending result.');
        // Make request with answer
        return self.request.get({
            url: answerUrl,
            qs: result,
            headers: headers
        });
    });
};

Cloudscraper.prototype.handle = function(response, body) {
    checkForErrors(body);

    // If body contains specified string, solve challenge
    if (body.indexOf('a = document.getElementById(\'jschl-answer\');') !== -1) {
        LOG.verbose('Detected CloudFlare protection. Attempt to resolve it.');
        return Promise.resolve().delay(Timeout).then(function() {
            return self.solveChallenge(response, body);
        });
    } else {
        // All is good
        return body;
    }
};

module.exports = Cloudscraper;
