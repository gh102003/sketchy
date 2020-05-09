import React, { useRef, useEffect, useState } from 'react'
import { socket } from "../../socket";

import { Countdown } from "../Countdown";
import { GuessForm } from './GuessForm.js';
import { CorrectGuessNotification } from './CorrectGuessNotification.js';

export const GuessingCanvas = props => {
    const canvas = useRef(null);

    const [correctGuess, setCorrectGuess] = useState(null);

    useEffect(() => {
        socket.on("canvas-draw", data => {
            if (!canvas.current) return;
            const ctx = canvas.current.getContext("2d");

            ctx.beginPath();

            ctx.strokeStyle = data.colour;
            ctx.lineWidth = data.lineWidth;
            ctx.moveTo(data.start.x, data.start.y);
            ctx.lineTo(data.end.x, data.end.y);
            ctx.stroke();

            ctx.closePath();
        });
        socket.on("canvas-clear", () => {
            if (!canvas.current) return;
            const ctx = canvas.current.getContext("2d");
            ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
            ctx.beginPath();
        });
        // Clear the canvas after the observation period
        socket.on("next-round", () => {
            if (!canvas.current) return;
            const ctx = canvas.current.getContext("2d");
            ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
            ctx.beginPath();
        });
    }, []); // No dependencies - very important to prevent adding event handlers multiple times after component updates

    useEffect(() => {
        setCorrectGuess(null);
    }, [props.currentRound]);

    return (
        <div className="game-main">
            <div className="game-info">
                <h2>Guessing</h2>
                <div className="round-countdown">
                    {props.currentRound.finished ?
                        <span className="round-countdown-status">Time's up!</span>
                        : <Countdown targetTime={props.currentRound.finishesAt} />
                    }
                </div>
            </div>
            <div className="canvas-wrapper">
                <canvas
                    className="game-canvas guessing-canvas"
                    width="600" height="450"
                    ref={canvas}
                />
                {correctGuess && <CorrectGuessNotification />}
            </div>
            {
                props.currentRound.finished
                && <div className="guessing-answer">It was: {props.currentRound.targetWord}</div>
            }
            {
                !correctGuess && !props.currentRound.finished && <GuessForm handleCorrect={guess => setCorrectGuess(guess)} />
            }

        </div>
    )
}
