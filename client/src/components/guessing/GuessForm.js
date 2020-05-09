import React, { useState } from 'react'
import { socket } from "../../socket";

export const GuessForm = props => {

    const [guess, setGuess] = useState("");

    return (
        <form className="guess-form" onSubmit={event => {
            event.preventDefault();
            socket.emit("guess", guess, isCorrect => isCorrect && props.handleCorrect(guess))
            setGuess("");
        }}>
            <input type="text" autoComplete="off" className="guess-input" autoFocus value={guess} onChange={event => setGuess(event.target.value)} />
            <input type="submit" value="Guess" />
        </form>
    )
}
