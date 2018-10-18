'use strict';

const sourceCoookie = 'X-Source';
const sourceMain = 'S3-spablue';
const sourceExperiment = 'S3-spagreen';
const experimentTraffic = 0.3;

// Viewer request handler
exports.handler = (event, context, callback) => {

    console.log('Viewer request handler received: ' + JSON.stringify(event, null, 2));

    const request = event.Records[0].cf.request;
    const headers = request.headers;

    // Look for source cookie
    if ( headers.cookie ) {
        for (let i = 0; i < headers.cookie.length; i++) {
            if (headers.cookie[i].value.indexOf(sourceCoookie) >= 0) {
                console.log('Source cookie found. Forwarding request as-is');
                // Forward request as-is
                callback(null, request);
                return;
            }
        }
    }

    console.log('Source cookie has not been found. Throwing dice...');
    const source = ( Math.random() < experimentTraffic ) ? sourceExperiment : sourceMain;
    console.log(`Source: ${source}`);

    // Add Source cookie
    const cookie = `${sourceCoookie}=${source}`;
    console.log(`Adding cookie header: ${cookie}`);
    headers.cookie = headers.cookie || [];
    headers.cookie.push({ key:'Cookie', value: cookie });

    // Forwarding request
    callback(null, request);
};
