let io;
const jwt = require("jsonwebtoken");
const { getAllowedOrigins } = require("../config/cors");

function initialize(server){

    io=require("socket.io")(server,{

        cors:{
            origin: getAllowedOrigins(),
            credentials: true
        }

    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
            return next(new Error("Token requerido para WebSocket"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error("Token inválido"));
        }
    });

    io.on("connection", (socket) => {
        console.log("Cliente conectado:", socket.id, "Usuario:", socket.user?.email);
        
        socket.on("disconnect", (reason) => {
            console.log("Cliente desconectado:", socket.id, "Razón:", reason);
        });
    });

    return io;

}

function getIO(){
    return io;
}

module.exports={
    initialize,
    getIO
};
