const fs = require('fs');
const http = require('http');
const https = require('https');
const app = require('./app');
const privateKey = fs.readFileSync('../../etc/letsencrypt/live/trackyour.site/privkey.pem', 'utf8');
const certificate = fs.readFileSync('../../etc/letsencrypt/live/trackyour.site/cert.pem', 'utf8');
const ca = fs.readFileSync('../../etc/letsencrypt/live/trackyour.site/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(3443, () => {
    console.log('HTTPS Server running on port 3443');
});




const httpServer = http.createServer(app);


httpServer.listen(3000, () => {
    console.log('hHTTP Server running on port 3000');
});


