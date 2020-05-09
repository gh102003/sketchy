import React from 'react';

import colours from "./colours";

export const Palette = props => {
    return (
        <div className="palette">
            <div className="colours">
                {colours.map(colour =>
                    <div
                        key={colour}
                        tabIndex="0"
                        className={colour === props.colour ? "colour colour-active" : "colour"}
                        style={{ backgroundColor: colour }}
                        onClick={() => props.handleColourChange(colour)}
                    />
                )}
            </div>
            <div className="line-widths">
                {[2, 5, 8, 13].map(lineWidth =>
                    <div
                        key={lineWidth}
                        tabIndex="0"
                        className={lineWidth === props.lineWidth ? "line-width line-width-active" : "line-width"}
                        style={{ height: (lineWidth * 0.16) + "vh" }}
                        onClick={() => props.handleLineWidthChange(lineWidth)}
                    />)}
            </div>
            <div className="tools">
                <button className="clear-canvas" onClick={() => props.handleClearCanvas()}>Clear</button>
            </div>
        </div>
    )
};
