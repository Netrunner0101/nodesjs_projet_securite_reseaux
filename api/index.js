require("dotenv").config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const router = require('./self_modules/routes/routes');
const routerSecure = require('./self_modules/routes/routesSecure');
const authorize = require('./self_modules/middlewares/authorize');
const corsOptions = require('./self_modules/middlewares/cors');
const cookieParser = require('cookie-parser'); 

const app = express();

app.use(express.urlencoded({extended:true}));
app.use(bodyParser.json({limit:"1.1MB"}));
app.use(express.static('public'));
app.use(cookieParser()); 
app.use(cors(corsOptions))
app.use('/', router);
app.use(authorize);
app.use('/', routerSecure);

const port = process.env.PORT || 3001

const server = app.listen(port, () => {
    console.info(`[SERVER] Listening on http://localhost:${port}`);
})

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`[SERVER] Port ${port} already in use. Attempting to free it...`);
        require('child_process').exec(`lsof -ti:${port} | xargs kill -9`, () => {
            setTimeout(() => {
                server.listen(port);
            }, 1000);
        });
    } else {
        console.error('[SERVER] Error:', err.message);
        process.exit(1);
    }
});

// Graceful shutdown: free the port on restart (SIGINT = Ctrl+C, SIGTERM = kill/nodemon)
function shutdown() {
    console.info('[SERVER] Shutting down gracefully...');
    server.close(() => {
        console.info('[SERVER] Port released.');
        process.exit(0);
    });
    // Force exit after 3s if connections hang
    setTimeout(() => process.exit(0), 3000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);