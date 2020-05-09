import React, { useState, useEffect } from 'react';

import { DrawingCanvas } from "./drawing/DrawingCanvas";
import { GuessingCanvas } from "./guessing/GuessingCanvas";
import { UserSetup } from "./UserSetup";
import { UserList } from "./UserList";
import { WaitingScreen } from "./WaitingScreen";
import { socket } from "../socket";

// localStorage.debug = "socket.io-client:socket";

export const App = () => {
    const [currentPlayerData, setCurrentPlayerData] = useState(null);
    const [userListVisible, setUserListVisible] = useState(false); // only used on mobile
    const [currentRound, setCurrentRound] = useState(null);
    const [matchScheduledTime, setMatchScheduledTime] = useState(null);
    const [inWaitingList, setInWaitingList] = useState(false);

    useEffect(() => {
        socket.on("schedule-match", data => {
            setInWaitingList(false);
            setMatchScheduledTime(data.scheduledTime);
        });

        socket.on("next-round", data => {
            setCurrentRound(data);
        });

        // Only received by the drawer
        socket.on("target-word", data => {
            setCurrentRound(currentRound => ({ ...currentRound, targetWord: data.targetWord }));
        });

        // Provides the target word to everyone (including the drawer) at the end of the round
        socket.on("finish-round", data => {
            setCurrentRound(currentRound => ({ ...currentRound, targetWord: data.targetWord, finished: true }));
        });

        socket.on("finish-match", () => {
            setCurrentRound(null);
            // Clear in case there is another match, but not sooner in case we want to display elapsed time
            setMatchScheduledTime(null);
        });
    }, []); // No dependencies - very important to prevent adding event handlers multiple times after component updates

    return (
        <div className="App">
            <header>
                <h1>Sketchy</h1>
                <span className="icon-with-label players-icon" onClick={() => setUserListVisible(!userListVisible)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M17.997 18h-11.995l-.002-.623c0-1.259.1-1.986 1.588-2.33 1.684-.389 3.344-.736 2.545-2.209-2.366-4.363-.674-6.838 1.866-6.838 2.491 0 4.226 2.383 1.866 6.839-.775 1.464.826 1.812 2.545 2.209 1.49.344 1.589 1.072 1.589 2.333l-.002.619zm4.811-2.214c-1.29-.298-2.49-.559-1.909-1.657 1.769-3.342.469-5.129-1.4-5.129-1.265 0-2.248.817-2.248 2.324 0 3.903 2.268 1.77 2.246 6.676h4.501l.002-.463c0-.946-.074-1.493-1.192-1.751zm-22.806 2.214h4.501c-.021-4.906 2.246-2.772 2.246-6.676 0-1.507-.983-2.324-2.248-2.324-1.869 0-3.169 1.787-1.399 5.129.581 1.099-.619 1.359-1.909 1.657-1.119.258-1.193.805-1.193 1.751l.002.463z" />
                    </svg>
                    <span className="label">
                        Players
                    </span>
                </span>
            </header>
            {!currentPlayerData && <UserSetup handleSubmit={data => {
                socket.emit("user-setup", data, success => setInWaitingList(!success));
                setCurrentPlayerData(data); // TODO: use for 'play again'
            }} />}
            <div className="game">
                {currentRound ? (
                    currentRound.playerDrawing === socket.id
                        ? <DrawingCanvas currentRound={currentRound} />
                        : <GuessingCanvas currentRound={currentRound} />
                ) : <WaitingScreen inWaitingList={inWaitingList} scheduledTime={matchScheduledTime} />}
                <UserList visible={userListVisible} handleChangeVisibility={setUserListVisible} playerDrawing={currentRound?.playerDrawing} />
            </div>
            <div className="credits">
                <p>
                    Game by George Howarth
                </p>
                <p>
                    Some words from the <a href="https://quickdraw.withgoogle.com/data">Quick, Draw! dataset</a>, collected by Google
                </p>
            </div>
        </div>
    );
}
