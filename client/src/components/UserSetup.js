import React, { useState } from 'react';

export const UserSetup = props => {

    const [username, setUsername] = useState("");

    return (
        <div className="user-setup">
            <form onSubmit={event => {
                event.preventDefault();
                const data = { username };
                props.handleSubmit(data);
            }}>
                <label htmlFor="username-input">
                    <h2>Choose a name</h2>
                </label>
                <input id="username-input" type="text" autoFocus value={username} onChange={e => setUsername(e.target.value)} />

                <input type="submit" disabled={!username} value="Continue" />
            </form>
        </div>
    )
}
