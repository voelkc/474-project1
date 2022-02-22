import React, { useState } from "react";

import * as dfd from "danfojs"

import { Plot } from './Plot'
import { Table } from './Table'
import { Controller } from './Controller'

export function InteractiveDataViz(props) {
    const [controls, setControls] = useState({
        x: 'time',
        y: 'incident-count',
        filters: [],
        timeFrame: [undefined, undefined], //min-max
        plotType: 'dot',
    })
    console.log(props.data)
    let dataDF
    let cleanData


    let fullMax = 1
    let fullMin = 0

    const changeTimeFrame = (newTimeFrame) => {
        console.log('ohhhhh')
        let updatedControls = { ...controls }
        updatedControls.timeFrame = newTimeFrame
        console.log(controls)
        setControls(updatedControls)
        console.log('did I set the state?')
        console.log(controls)

    }

    if (props.data !== undefined && props.data.length > 0) {

        //Sort the data before converting!!!!
        //By time
        cleanData = props.data.sort((a, b) => a.UTC - b.UTC)
        console.log(cleanData)

        //Get fullMax and fullMin
        fullMin = cleanData[0].UTC
        fullMax = cleanData[cleanData.length - 1].UTC
        console.log(fullMin, fullMax)
        console.log(new Date(fullMin), new Date(fullMax))


        //Filter before converting
        console.log('filtering')
        cleanData = cleanData.filter((incident) => {
            if (controls.timeFrame !== undefined) {
                if (controls.timeFrame[0] > incident.UTC) { // if min date is larger than incident date
                    return false // kill it
                }
            }

            if (controls.timeFrame !== undefined) {
                if (controls.timeFrame[1] < incident.UTC) { // if max date is smaller than incident date
                    return false // kill it
                }
            }
            return true
        })

        dataDF = new dfd.DataFrame(cleanData)
        dataDF.ctypes.print()
        dataDF.print()
        dataDF.tail(10).print()

        //Do group by?
    }

    return (
        <>
            <div className='interactive-data-viz'>
                <Controller controls={controls} changeTimeFrame={changeTimeFrame} fullMin={fullMin} fullMax={fullMax} />
                <Plot />
            </div>
            < Table data={cleanData} />
        </>)
}