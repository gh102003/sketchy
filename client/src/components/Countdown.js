import React, { useState, useEffect } from 'react';

export const Countdown = props => {

    // Used to cache time so that React will rerender when updated by interval function
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const handle = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(handle);
    }, [])

    if (props.targetTime < currentTime) {
        return null
    };
    
    const countdownDisplay = (Math.floor((props.targetTime - currentTime) / 1000))

    return (
        <span className="countdown">
            {countdownDisplay}
        </span>
    );

};
