import React from 'react';

export const CorrectGuessNotification = props => {
    return (
        <div className="correct-guess-notification">
            Well done! Your guess {props.guess} was correct
        </div>
    )
}
