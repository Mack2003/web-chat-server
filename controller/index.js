const myServer = require('express');
const app = myServer();
const cors = require('cors');
const server = require('http').createServer(app);
const bodyPerser = require('body-parser')
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
});
const userPath = require('../routes/users');


// Apply CORS middleware to entire Express app
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": true,
    "optionsSuccessStatus": 204
}));

// Middleware to see json data coming from request

app.use(bodyPerser.json()) 
app.use(bodyPerser.urlencoded({ extended: false }))

// Apply user route

app.use('/users', userPath);


server.listen(4000, (err) => {
    if (err) return console.log(`An error ${err}`);
    console.log("Server started on port number 4000");
});


// Setting up sokit facility to send and recive massages

io.on('connection', sokit => {
    sokit.on("sendMassage", data => {
        io.emit(data.to, data);
    });
});