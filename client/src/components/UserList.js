import React, { useEffect, useState, useRef } from 'react'
import { socket } from "../socket";

export const UserList = props => {

    const [users, setUsers] = useState([]);

    // DOM element, used in click handler
    const userList = useRef();

    useEffect(() => {
        // if (!window.matchMedia("only screen and (max-width: 900px)")) {
        //     return;
        // }

        const listener = document.addEventListener("mousedown", event => {
            if (props.visible && !userList.current.contains(event.target)) {
                props.handleChangeVisibility(!props.visible);
            }
        });

        return () => {
            document.removeEventListener("click", listener);
        };
    }, [props]);

    useEffect(() => {
        socket.on("users", users => {
            setUsers(users);
        });
    }, []);

    return (
        <div className={props.visible ? "user-list user-list-visible" : "user-list"} ref={userList}>
            <h2>Players</h2>
            <ul>
                {Object.values(users).sort((a, b) => b.points - a.points).map(user =>
                    <li className="user" key={user.id}>
                        {/* <span style={{ fontSize: "0.5em" }} className="player-id">{user.id}</span> */}
                        <span className="username">{user.username}{socket.id === user.id && " (you)"}</span>
                        {props.playerDrawing === user.id ? <span className="drawing-indicator">Drawing</span> : <span />}
                        <span className="points">{user.points}</span>
                    </li>
                )}
            </ul>
        </div>
    )
};
