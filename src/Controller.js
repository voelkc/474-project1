import React, { useState } from "react";

import { Slider, Rail, Handles, Tracks } from 'react-compound-slider'


export function Controller(props) {
    const [min, setMin] = useState(new Date(props.fullMin))
    const [max, setMax] = useState(new Date(props.fullMax))

    let controls = props.controls
    let setControls = props.setControls


    // Sliding bar stuff
    const onUpdate = update => {
        console.log(update)
        setMin(new Date(update[0]))
        setMax(new Date(update[1]))

    }

    const onChange = values => {
        console.log(values)
        setMin(new Date(values[0]))
        setMax(new Date(values[1]))
        // set the state for the parent now too!
        let timeFrame = [min.getTime() + min.getTimezoneOffset() * 60000, max.getTime() + max.getTimezoneOffset() * 60000]
        props.changeTimeFrame(timeFrame)

    }

    const sliderStyle = {  // Give the slider some width
        position: 'relative',
        width: '100%',
        height: 80,
    }

    const railStyle = {
        position: 'absolute',
        width: '100%',
        height: 10,
        marginTop: 35,
        borderRadius: 5,
        backgroundColor: 'rgb(120, 120, 120)',
    }


    return (<div className="controller">
        <h1>Data Controls</h1>
        <form>
            <h2>X-Axis</h2>
            <input type="radio"></input>
            <label>Time</label>
            <input type="radio"></input>
            <label>Officer</label>
            <h2>Y-Axis</h2>
            <label>Y-Axis</label>
            <input type="radio"></input>
            <label>Filters</label>
            <input type="checkbox"></input>

            <h2>Date Range</h2>

            <Slider
                rootStyle={sliderStyle}
                domain={[props.fullMin, props.fullMax]}
                step={1}
                mode={2}
                values={[props.fullMin, props.fullMax]}
                onUpdate={onUpdate}
                onChange={onChange}
            >
                <Rail>
                    {({ getRailProps }) => (
                        <div style={railStyle} {...getRailProps()} />
                    )}
                </Rail>
                <Handles>
                    {({ handles, getHandleProps }) => (
                        <div className="slider-handles">
                            {handles.map(handle => (
                                <Handle
                                    key={handle.id}
                                    handle={handle}
                                    getHandleProps={getHandleProps}
                                />
                            ))}
                        </div>
                    )}
                </Handles>
                <Tracks left={false} right={false}>
                    {({ tracks, getTrackProps }) => (
                        <div className="slider-tracks">
                            {tracks.map(({ id, source, target }) => (
                                <Track
                                    key={id}
                                    source={source}
                                    target={target}
                                    getTrackProps={getTrackProps}
                                />
                            ))}
                        </div>
                    )}
                </Tracks>
            </Slider>
            <p>{`${min.getMonth() + 1}/${min.getDate()}/${min.getYear() + 1900}`} - {`${max.getMonth() + 1}/${max.getDate()}/${max.getYear() + 1900}`}</p>

        </form>
    </div>)
}

export function Handle({
    handle: { id, value, percent },
    getHandleProps
}) {
    return (
        <div
            style={{
                left: `${percent}%`,
                position: 'absolute',
                marginLeft: -15,
                marginTop: 25,
                zIndex: 2,
                width: 30,
                height: 30,
                border: 0,
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                backgroundColor: 'rgb(190, 190, 190)',
                color: 'rgba(0,0,0,0)',
            }}
            {...getHandleProps(id)}
        >
            <div style={{
                fontFamily: " font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans- serif", fontSize: 11, marginTop: 35
            }}>
                {value}
            </div>
        </div >
    )
}

function Track({ source, target, getTrackProps }) {
    return (
        <div
            style={{
                position: 'absolute',
                height: 10,
                zIndex: 1,
                marginTop: 35,
                backgroundColor: 'rgb(230, 230, 230)',
                borderRadius: 5,
                cursor: 'pointer',
                left: `${source.percent}%`,
                width: `${target.percent - source.percent}%`,
            }}
            {...getTrackProps() /* this will set up events if you want it to be clickable (optional) */}
        />
    )
}
