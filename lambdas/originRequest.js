'use strict';

const sourceCoookie = 'X-Source';
const sourceMain = 'S3-spablue';
const sourceExperiment = 'S3-spagreen';
const experimentBucketName = 'spagreen.s3.amazonaws.com';
const experimentBucketRegion = 'us-east-1';

// Origin Request handler
exports.handler = (event, context, callback) => {

    console.log('Origin Request handler received: ' + JSON.stringify(event, null, 2));

    const request = event.Records[0].cf.request;
    const headers = request.headers;

    const source = decideSource(headers);

    // If Source is Experiment, change Origin and Host header
    if ( source === sourceExperiment ) {

        console.log('Setting Origin to experiment bucket');

        // Specify Origin
        request.origin = {
            s3: {
                authMethod: 'none',
                domainName: experimentBucketName,
                path: '',
                region: experimentBucketRegion
            }
        };

        // Also set Host header to prevent “The request signature we calculated does not match the signature you provided” error
        headers['host'] = [{key: 'host', value: experimentBucketName }];
    } else {

        console.log('Setting Origin to main bucket');

        // Specify Origin
        request.origin = {
            s3: {
                authMethod: 'none',
                domainName: "spablue.s3.amazonaws.com",
                path: '',
                region: experimentBucketRegion
            }
        };

        // Also set Host header to prevent “The request signature we calculated does not match the signature you provided” error
        headers['host'] = [{key: 'host', value: "spablue.s3.amazonaws.com" }];

    }
    // No need to change anything if Source was Main or undefined

    callback(null, request);
};


// Decide source based on source cookie.
const decideSource = function(headers) {

    const sourceMainCookie = `${sourceCoookie}=${sourceMain}`;
    const sourceExperimenCookie = `${sourceCoookie}=${sourceExperiment}`;

    // Remember a single cookie header entry may contains multiple cookies
    if (headers.cookie) {
        // ...ugly but simple enough for now
        for (let i = 0; i < headers.cookie.length; i++) {
            if (headers.cookie[i].value.indexOf(sourceExperimenCookie) >= 0) {
                console.log('Experiment Source cookie found');
                return sourceExperiment;
            }
            if (headers.cookie[i].value.indexOf(sourceMainCookie) >= 0) {
                console.log('Main Source cookie found');
                return sourceMain;
            }
        }
    }
    console.log('No Source cookie found (Origin undecided)');
};
