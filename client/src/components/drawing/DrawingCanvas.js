import React, { useRef, useState, useEffect } from 'react';
import { socket } from "../../socket";

import { Palette } from './Palette.js';
import colours from "./colours";
import { Countdown } from '../Countdown.js';

export const DrawingCanvas = props => {
    const [colour, setColour] = useState(colours[0]);
    const [lineWidth, setLineWidth] = useState(2);

    const canvas = useRef();
    let lineStartPoint = null;

    // Add event listeners to the window to prevent scrolling on the canvas
    useEffect(() => {
        const listenerTouchStart = document.body.addEventListener("touchstart", event => {
            if (event.target === canvas.current) {
                event.preventDefault();
            }
        }, { passive: false });

        const listenerTouchEnd = document.body.addEventListener("touchend", event => {
            if (event.target === canvas.current) {
                event.preventDefault();
            }
        }, { passive: false });

        const listenerTouchMove = document.body.addEventListener("touchmove", event => {
            if (event.target === canvas.current) {
                event.preventDefault();
            }
        }, { passive: false });
        return () => {
            document.body.removeEventListener("touchstart", listenerTouchStart);
            document.body.removeEventListener("touchend", listenerTouchEnd);
            document.body.removeEventListener("touchmove", listenerTouchMove);
        }
    }, []);

    const clientToCanvasCoords = (clientX, clientY) => {
        const canvasDims = canvas.current.getBoundingClientRect();
        // Adjust for offset and CSS scaling of canvas
        const x = (clientX - canvasDims.x) / canvasDims.width * canvas.current.width;
        const y = (clientY - canvasDims.y) / canvasDims.height * canvas.current.height;
        return { x, y };
    };

    const draw = (clientX, clientY) => {

        const { x, y } = clientToCanvasCoords(clientX, clientY);

        if (!lineStartPoint) {
            lineStartPoint = { x, y };
            return;
        }

        // Draw line
        const ctx = canvas.current.getContext("2d");
        ctx.beginPath(); // Separate colour to last path
        ctx.strokeStyle = colour;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(lineStartPoint.x, lineStartPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.closePath();

        socket.emit("canvas-draw", {
            start: lineStartPoint,
            end: { x, y },
            colour,
            lineWidth
        });

        // Reset draw start
        lineStartPoint = { x, y };
    };

    const clear = () => {
        const ctx = canvas.current.getContext("2d");
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
        ctx.beginPath();
        socket.emit("canvas-clear");
    };

    /**
     * @param {Function} fn the base function to call
     * @param {number} minSpacing the shortest time (in ms) between the function calls  
     * @returns a function that will be throttled
     */
    const throttle = (fn, minSpacing) => {
        let lastCall = null;

        return (...params) => {
            const now = new Date()
            if (!lastCall || now - lastCall >= minSpacing) {
                fn(...params);
                lastCall = now;
            }
        };
    }

    return (
        <div className="game-main">
            <div className="game-info">
                <h2>Drawing: {props.currentRound.targetWord}</h2>
                <div className="round-countdown">
                    {props.currentRound.finished ?
                        <span className="round-countdown-status">Time's up!</span>
                        : <Countdown targetTime={props.currentRound.finishesAt} />
                    }
                </div>
            </div>
            <div className="canvas-wrapper">
                <canvas
                    className="game-canvas drawing-canvas"
                    width="600" height="450"
                    ref={canvas}
                    onMouseMove={throttle(event => event.buttons === 1 && draw(event.clientX, event.clientY), 15)}
                    onMouseUp={() => lineStartPoint = null}
                    onTouchMove={throttle(event => draw(event.touches[0].clientX, event.touches[0].clientY), 15)}
                    onTouchEnd={() => lineStartPoint = null}
                />
            </div>
            <Palette
                colour={colour} handleColourChange={setColour}
                lineWidth={lineWidth} handleLineWidthChange={setLineWidth}
                handleClearCanvas={clear}
            />
        </div>
    )
};
