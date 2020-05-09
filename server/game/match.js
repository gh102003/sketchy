const Round = require("./round");
const words = require("./words");

class Match {

    rounds = [];
    /** 
     * "waiting" (more players need to join), 
     * "scheduled" (the game will start in a few seconds)
     * "playing" (in or between rounds), 
     * or "finished" (every player has drawn)
    */
    gameState = "waiting";
    users = {}; // Socket ids to user data
    socketServer;
    scheduledTime;
    afterFinished;

    constructor(socketServer, afterFinished) {
        this.socketServer = socketServer;
        this.afterFinished = afterFinished;
    }

    get currentRound() {
        if (this.rounds.length < 1) {
            return null;
        }
        return this.rounds[this.rounds.length - 1]
    }

    get playersDrawn() {
        return this.rounds.map(round => round.playerDrawing);
    }

    canvasDraw(socket, data) {
        if (this.gameState === "playing" && this.currentRound) {
            this.currentRound.canvasDraw(socket, data);
        }
    }

    canvasClear(socket) {
        if (this.gameState === "playing" && this.currentRound) {
            this.currentRound.canvasClear(socket);
        }
    }

    /**
     * Checks if the guess was correct and allocates points
     * 
     * @returns {?Boolean} whether the guess was correct, or null if it was invalid (e.g. user is not guessing)
     */
    guess(socket, word) {
        if (this.gameState === "playing" && this.currentRound) {
            const isCorrect = this.currentRound.guess(socket, word);
            // Add points if correct
            if (isCorrect) {
                this.users[socket.id].points += 10;
                this.socketServer.emit("users", this.users);
            }
            return isCorrect;
        } else {
            return null;
        }
    }

    nextRound() {
        // If the match has been scheduled but everyone has left
        if (this.gameState === "finished") {
            return;
        }

        const playersLeftToDraw = Object.keys(this.users).filter(user => !this.playersDrawn.includes(user));
        if (playersLeftToDraw.length < 1) {
            this.finish();
            return;
        }

        console.log("Next round");
        this.gameState = "playing";

        const playerDrawingIndex = Math.floor(Math.random() * playersLeftToDraw.length);
        const playerDrawing = playersLeftToDraw[playerDrawingIndex];

        const targetWordIndex = Math.floor(Math.random() * words.length);
        const nextRound = new Round(this.socketServer, this, playerDrawing, words[targetWordIndex], 90 * 1000)
        this.rounds.push(nextRound);
    }

    scheduleStart() {
        this.gameState = "scheduled";
        this.scheduledTime = Date.now() + 20 * 1000;
        this.socketServer.to("match").emit("schedule-match", { scheduledTime: this.scheduledTime });

        setTimeout(() => this.nextRound(), this.scheduledTime - Date.now());
    }

    finish() {
        console.log("finished match");
        this.gameState = "finished";
        this.socketServer.to("match").emit("finish-match");

        // Remove players from the match room
        Object.values(this.socketServer.of("/").connected)
            .filter(socket => Object.values(socket.rooms).includes("match"))
            .forEach(socket => socket.leave("match"));

        this.afterFinished();
    }

    /**
     * @returns true if successful, false if failed (game already playing or finished)
     */
    addUser(socket) {
        if (this.gameState !== "waiting" && this.gameState !== "scheduled") {
            console.log("user could not join because the match has already started");
            socket.join("waiting");
            return false;
        }

        socket.leave("waiting");
        socket.join("match");

        this.users[socket.id] = socket.user;
        console.log(`${socket.id} joined`);

        // Let all users (including the new one) know of all the users
        this.socketServer.to("match").emit("users", this.users);

        // Send to client if the match is scheduled or playing
        if (this.gameState === "scheduled") {
            socket.emit("schedule-match", { scheduledTime: this.scheduledTime });
        }

        // Start the match if there are two or more players
        if (this.gameState === "waiting" && Object.keys(this.users).length > 1) {
            this.scheduleStart();
        }

        return true;
    }

    removeUser(socket) {
        delete this.users[socket.id];

        socket.to("match").emit("users", this.users);

        socket.leave("match");

        if (this.users.length < 1) {
            console.log("all users disconnected - finishing match early");
            this.finish();
        }
    }
}

module.exports = Match;