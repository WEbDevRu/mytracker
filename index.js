const http = require('http');
const app = require('./app');
const httpServer = http.createServer(app);


httpServer.listen(3000, () => {
    console.log('hHTTP Server running on port 3000');
});


