const Line = require("./line");

class Round {
    playerDrawing;
    targetWord;
    lines = [];
    finishesAt;
    socketServer;
    playersCorrect = [];
    finished = false;

    /**
     * @param {} socketServer
     * @param {string} playerDrawing id of the player who is drawing
     * @param {string} targetWord the word to draw and guess
     * @param {Number} duration how long, in ms, the round should last
     */
    constructor(socketServer, match, playerDrawing, targetWord, duration) {
        this.socketServer = socketServer;
        this.match = match;
        this.playerDrawing = playerDrawing;
        this.targetWord = targetWord;
        this.finishesAt = Date.now() + duration;

        setTimeout(() => this.finish(), duration);

        console.log(`${playerDrawing} is drawing`);

        this.socketServer.to("match").emit("next-round", { playerDrawing: this.playerDrawing, finishesAt: this.finishesAt });
        this.socketServer.to(playerDrawing).emit("target-word", { targetWord });
    }

    canvasDraw(socket, data) {
        if (socket.id === this.playerDrawing) {
            this.lines.push(new Line(data.start, data.end));
            socket.to("match").emit("canvas-draw", data);
        }
    }

    canvasClear(socket) {
        if (socket.id === this.playerDrawing) {
            this.lines = [];
            socket.to("match").emit("canvas-clear");
        }
    }

    /**
     * Checks if the guess was correct
     * 
     * @returns {?Boolean} whether the guess was correct, or null if it was invalid (e.g. user is not guessing or already has the correct answer)
     */
    guess(socket, word) {
        if (socket.id === this.playerDrawing || this.playersCorrect.includes(socket.id)) {
            return null;
        }

        const normalise = string => string.toLowerCase().trim();

        const isCorrect = normalise(word) === normalise(this.targetWord);
        if (isCorrect) {
            this.playersCorrect.push(socket.id);
        }

        if (this.playersCorrect.length + 1 >= Object.keys(this.match.users).length) { // Adjust for the player who is drawing
            this.finish();
        }
        return isCorrect;
    }

    finish() {
        if (!this.finished) { // in case the timeout from the start tries to finish the round after it is finished early (all players have got the correct answer)
            this.finished = true;
            this.socketServer.to("match").emit("finish-round", { targetWord: this.targetWord });
            // Wait before next round to let players see the answer
            setTimeout(() => this.match.nextRound(), 8000);
        }
    }
}

module.exports = Round;