const jwt = require('jsonwebtoken');
const createError = require('http-errors');
import User from "./models/User";

// const options = {
//     allowUpgrades: true,
//     transports: [ 'polling', 'websocket' ],
//     pingTimeout: 9000,
//     pingInterval: 3000,
//     cookie: 'mycookie',
//     httpCompression: true,
//     origins: '*:*'
// };

module.exports = (server) => {
    const io = require('socket.io')(server,
      {
        cors: {
            origin: "http://localhost:3000",
            credentials: true
        }
      }
    );
    // io.set('origins', 'http://192.168.1.8:* http://localhost:* http://domain.net:* http://domain.gov:*');

    io.use(function(socket, next) {
        if(socket.handshake.query && socket.handshake.query.token) {
            // console.log('[socket.ts || Line no. 10 ....]', socket.handshake.query);
            let decodedToken;
            try {
                decodedToken = jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET_KEY);
                socket.decodedToken = decodedToken;
            } catch(e) {
                return next(createError(500, 'Something went wrong!'));
            }
            if(!decodedToken) {
                return next(createError(401, 'Not authorized!'));
            }
            next();
        }


    })
    .on('connection', async (socket) => {

        const connectedUserId = socket.decodedToken.userId;

        const connectedUser = await User.findById(connectedUserId);

        if(!connectedUser) {
            return;
        }

        console.log('[socket.js || Line no. 29 ....]', 'Connected to ' + socket.id);
        // return;

        connectedUser.status = 'online';
        connectedUser.activity = {
            status: 'online',
            lastOnline: Date.now()
        };
        connectedUser.socketId = socket.id;

        await connectedUser.save();

        io.to(socket.id).emit('logged_in', {
            _id: connectedUser._id,
            fullName: connectedUser.fullName,
            email: connectedUser.email,
            image: connectedUser.image,
            notifications: {
                entities: {},
                results: connectedUser.notifications
            },
            conversations: {
                entities: {},
                results: connectedUser.conversations
            },
            friends: {
                entities: {},
                results: connectedUser.friends
            }
        });

        socket.broadcast.emit('user_status', {userId: connectedUser._id, status: connectedUser.status});

        socket.on('disconnect', async (socket) => {
            const connectedUser = await User.findById(connectedUserId);

            console.log('[socket.js || Line no. 29 ....]', 'Disconnected');


            // if(connectedUser.status !== 'offline') {
            connectedUser.status = 'offline';
            connectedUser.activity = {
                status: 'offline',
                lastOnline: Date.now()
            };
            connectedUser.socketId = undefined;

            io.emit('user_status', {userId: connectedUser._id, status: "offline"});
    
                await connectedUser.save();
            // }
        })

    })

    return io;
}
