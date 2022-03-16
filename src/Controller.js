import { rollups } from "d3";
import React, { useState } from "react";

import { Slider, Rail, Handles, Tracks } from 'react-compound-slider'


export function Controller(props) {
    const [min, setMin] = useState(new Date(props.fullMin))
    const [max, setMax] = useState(new Date(props.fullMax))


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

    console.log('Controller Rendering')
    return (<div className="controller">
        <form>
            {/* <h2>X-Axis</h2>
            <input type="radio"></input>
            <label>Time</label>
            <input type="radio"></input>
            <label>Officer</label>
            <h2>Y-Axis</h2>
            <label>Y-Axis</label>
            <input type="radio"></input> */}

            <h2>Display</h2>
            <div className="input-group">
                <div className="input">
                    <input type="radio" onChange={() => { props.changePlotType('plot') }} checked={props.controls.plotType == 'plot'}></input>
                    <label>Time Plot</label>
                </div>
                <div className="input">
                    <input type="radio" onChange={() => { props.changePlotType('officer') }} checked={props.controls.plotType == 'officer'}></input>
                    <label>Officer Plot</label>
                </div>
                <div className="input">
                    <input type="radio" onChange={() => { props.changePlotType('map') }} checked={props.controls.plotType == 'map'}></input>
                    <label>Map</label>
                </div>
                <div className="input">
                    <input type="radio" onChange={() => { props.changePlotType('table') }} checked={props.controls.plotType == 'table'}></input>
                    <label>Table</label>
                </div>
            </div>


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
            <p className="date-label">{`${min.getMonth() + 1}/${min.getDate()}/${min.getYear() + 1900}`} - {`${max.getMonth() + 1}/${max.getDate()}/${max.getYear() + 1900}`}</p>

            <h2>Subject Filters</h2>
            <h3>Race</h3>
            <div className="input-group">
                <div className="input">
                    <input type="checkbox" onChange={() => { props.toggleFilter('race', 'White') }} checked={props.controls.filters.race.includes('White')}></input>
                    <label>White</label>
                </div>
                <div className="input">
                    <input type="checkbox" onChange={() => { props.toggleFilter('race', 'Black or African American') }} checked={props.controls.filters.race.includes('Black or African American')}></input>
                    <label>Black</label>
                </div>
                <div className="input">
                    <input type="checkbox" onChange={() => { props.toggleFilter('race', 'Asian') }} checked={props.controls.filters.race.includes('Asian')}></input>
                    <label>Asian</label>
                </div>
                <div className="input">
                    <input type="checkbox" onChange={() => { props.toggleFilter('race', 'Hispanic or Latino') }} checked={props.controls.filters.race.includes('Hispanic or Latino')}></input>
                    <label>Hispanic</label>
                </div>
                <div className="input">
                    <input type="checkbox" onChange={() => { props.toggleFilter('race', 'American Indian/Alaska Native') }} checked={props.controls.filters.race.includes('American Indian/Alaska Native')}></input>
                    <label>Native American</label>
                </div>
                <div className="input">
                    <input type="checkbox" onChange={() => { props.toggleFilter('race', 'Nat Hawaiian/Oth Pac Islander') }} checked={props.controls.filters.race.includes('Nat Hawaiian/Oth Pac Islander')}></input>
                    <label>Pacific Islander</label>
                </div>
                <div className="input">
                    <input type="checkbox" onChange={() => { props.toggleFilter('race', 'Not Specified') }} checked={props.controls.filters.race.includes('Not Specified')}></input>
                    <label>Not Specified</label>
                </div>
            </div>
            <h3>Gender</h3>
            <div>
                <div className="input-group">
                    <div className="input">
                        <input type="checkbox" onChange={() => { props.toggleFilter('gender', 'Male') }} checked={props.controls.filters.gender.includes('Male')}></input>
                        <label>Male</label>
                    </div>
                    <div className="input">
                        <input type="checkbox" onChange={() => { props.toggleFilter('gender', 'Female') }} checked={props.controls.filters.gender.includes('Female')}></input>
                        <label>Female</label>
                    </div>
                    <div className="input">
                        <input type="checkbox" onChange={() => { props.toggleFilter('gender', 'Not Specified') }} checked={props.controls.filters.gender.includes('Not Specified')}></input>
                        <label>Not Specified</label>
                    </div>
                </div>
            </div>
            <h2>Incident Filters</h2>
            <h3>Incident Level</h3>
            <div>
                <div className="input-group">
                    <div className="input">
                        <input type="checkbox" onChange={() => { props.toggleFilter('type', 'Level 1 - Use of Force') }} checked={props.controls.filters.type.includes('Level 1 - Use of Force')}></input>
                        <label>Level 1</label>
                    </div>
                    <div className="input">
                        <input type="checkbox" onChange={() => { props.toggleFilter('type', 'Level 2 - Use of Force') }} checked={props.controls.filters.type.includes('Level 2 - Use of Force')}></input>
                        <label>Level 2</label>
                    </div>
                    <div className="input">
                        <input type="checkbox" onChange={() => { props.toggleFilter('type', 'Level 3 - Use of Force') }} checked={props.controls.filters.type.includes('Level 3 - Use of Force')}></input>
                        <label>Level 3 (Non-Shooting)</label>
                    </div>
                    <div className="input">
                        <input type="checkbox" onChange={() => { props.toggleFilter('type', 'Level 3 - OIS') }} checked={props.controls.filters.type.includes('Level 3 - OIS')}></input>
                        <label>Level 3 (Shooting)</label>
                    </div>
                </div>
            </div>
            <h3>Location (SPD Precinct)</h3>
            <div>
                <div className="input-group">
                    <div className="input">
                        <input type="checkbox" onChange={() => { props.toggleFilter('precinct', 'North') }} checked={props.controls.filters.precinct.includes('North')}></input>
                        <label>North</label>
                    </div>
                    <div className="input">
                        <input type="checkbox" onChange={() => { props.toggleFilter('precinct', 'West') }} checked={props.controls.filters.precinct.includes('West')}></input>
                        <label>West</label>
                    </div>
                    <div className="input">
                        <input type="checkbox" onChange={() => { props.toggleFilter('precinct', 'East') }} checked={props.controls.filters.precinct.includes('East')}></input>
                        <label>East</label>
                    </div>
                    <div className="input">
                        <input type="checkbox" onChange={() => { props.toggleFilter('precinct', 'South') }} checked={props.controls.filters.precinct.includes('South')}></input>
                        <label>South</label>
                    </div>
                    <div className="input">
                        <input type="checkbox" onChange={() => { props.toggleFilter('precinct', 'Southwest') }} checked={props.controls.filters.precinct.includes('Southwest')}></input>
                        <label>Southwest</label>
                    </div>
                    <div className="input">
                        <input type="checkbox" onChange={() => { props.toggleFilter('precinct', '-') }} checked={props.controls.filters.precinct.includes('-')}></input>
                        <label>Not Specified</label>
                    </div>
                </div>
            </div>
        </form >
    </div >)
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
