import React from "react";

// Plots data coming from App's state. Can be dot plot, map, table....idk
// gives a key
// should be dynamic to the size of the web page
export function Plot(props) {


    const plotPoints = {

    }

    return (<div>
        <svg width="1200"
            height="600"
            stroke="white">
            <rect
                width="1200"
                height="600"
                stroke="white"
            />
        </svg>
    </div>)
}