import React from 'react';
import { Countdown } from "./Countdown";

export const WaitingScreen = props => {
    if (props.inWaitingList) {
        return (
            <div className="waiting-screen">
                <p>The game has already started, but you'll be put in the next one</p>
            </div>
        );
    }

    return (
        <div className="waiting-screen">
            {props.scheduledTime
                ? <p>Match starting in <Countdown targetTime={props.scheduledTime} /></p>
                : <p>Waiting for more players</p>
            }
        </div>
    );
}
