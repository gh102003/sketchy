const app = require('express')();
const server = require('http').Server(app);
const socketio = require('socket.io')(server);

const Match = require("./game/match");

server.listen(3001);

let currentMatch;

const nextMatch = () => {
    currentMatch = new Match(socketio, nextMatch);

    // Move players waiting into the match
    Object.values(socketio.of("/").connected)
        .filter(socket => Object.values(socket.rooms).includes("waiting"))
        .forEach(socket => currentMatch.addUser(socket));
};

nextMatch();

socketio.on("connection", socket => {
    socket.on("canvas-draw", data => {
        currentMatch.canvasDraw(socket, data);
    });

    socket.on("canvas-clear", () => {
        currentMatch.canvasClear(socket);
    });

    socket.on("user-setup", (data, respond) => {
        socket.user = { ...data, id: socket.id, points: 0 };

        if (currentMatch.gameState === "finished") {
            console.log("user joined after match finished, start new match");
            nextMatch();
        }
        respond(currentMatch.addUser(socket));
    });

    socket.on("disconnect", () => {
        currentMatch.removeUser(socket);
    });

    socket.on("guess", (wordGuessed, respond) => {
        console.log(`${socket.id} guessed '${wordGuessed}'`);

        const isCorrect = currentMatch.guess(socket, wordGuessed);
        if (isCorrect !== null) {
            respond(isCorrect);
        }
    });
});