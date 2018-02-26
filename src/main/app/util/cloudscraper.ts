/*
 * Original code made by https://github.com/codemanki/cloudscraper modified to use Promises and fit personal usecase.
 */

import Logger from "./log";
import * as Promise from "bluebird";

const TIMEOUT = 5500; // Cloudflare requires a delay of 5 seconds, so wait for at least 5.5.

class Cloudscraper {
    request: any; // For some reason, setting this to Request or RequestAPI as a type makes it not have `get` and similar functions ...

    constructor(request) {
        this.request = request;
    }

    handle(response, body: string): Promise<string> {
        checkForErrors(body);
        // If body contains specified string, solve challenge
        if(body.indexOf('a = document.getElementById(\'jschl-answer\');') !== -1) {
            Logger.verbose('Detected CloudFlare protection. Attempt to resolve it.');
            return Promise.resolve().delay(TIMEOUT).then(() => {
                return this.solveChallenge(response, body);
            });
        } else {
            // All is good
            return Promise.resolve(body);
        }
    }

    solveChallenge(response, body: string): Promise<any> {
        const host = response.request.host;
        const matchedChallengeID = body.match(/name="jschl_vc" value="(\w+)"/);

        if(!matchedChallengeID) {
            throw new Error('Cloudflare: Cant extract challengeId (jschl_vc) from page.');
        }

        const jsChlVc = matchedChallengeID[1];
        const matchedChallenge = body.match(/getElementById\('cf-content'\)[\s\S]+?setTimeout.+?\r?\n([\s\S]+?a\.value =.+?)\r?\n/i);

        if(!matchedChallenge) {
            throw new Error('Cloudflare: Cant extract method from setTimeOut wrapper.');
        }

        const challengeContent = matchedChallenge[1];
        const evaluableChallenge = challengeContent.replace(/a\.value =(.+?) \+ .+?;( '.+')?/i, '$1').replace(/\s{3,}[a-z](?: = |\.).+/g, '');
        const challenge_pass = body.match(/name="pass" value="(.+?)"/)[1];

        return Promise.try(() => {
            const challengeResult = eval(evaluableChallenge);
            return {
                'jschl_vc': jsChlVc,
                'jschl_answer': (challengeResult + response.request.host.length),
                'pass': challenge_pass
            };
        }).then((result) => {
            const answerUrl = response.request.uri.protocol + '//' + host + '/cdn-cgi/l/chk_jschl';

            const headers = {
                Referer: response.request.uri.href // Original url should be placed as referer
            };
            Logger.verbose('Solved CloudFlare with ' + JSON.stringify(result) + '. Sending result.');
            // Make request with answer
            return this.request.get({
                url: answerUrl,
                qs: result,
                headers: headers
            });
        });
    }
}

function checkForErrors(body: string) {
    // Finding captcha
    if(body.indexOf('why_captcha') !== -1 || /recaptcha/i.test(body)) {
        throw new Error('Detected Captcha');
    }

    // trying to find '<span class="cf-error-code">1006</span>'
    const match = body.match(/<\w+\s+class="cf-error-code">(.*)<\/\w+>/i);

    if(match) {
        throw new Error('unknown cloudflare error ' + match[1]);
    }
}

export default Cloudscraper;
