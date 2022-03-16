import React from "react";

import { AxisLeft, AxisBottom, AxisTop } from "@visx/axis";

import * as d3 from 'd3'

// Plots data coming from App's state. Can be dot plot, map, table....idk
// gives a key
// should be dynamic to the size of the web page
export function Plot(props) {
    const width = window.innerWidth - 255
    const height = window.innerHeight - 100
    const axisMargin = 50
    const nonAxisMargin = 15

    const data = props.data
    const plotData = props.plotData

    //find max and min
    let maxCount = -1
    plotData.forEach((date) => {
        if (date[1] > maxCount) {
            maxCount = date[1]
        }
    })
    let maxDate = plotData[plotData.length - 1][0]
    let minDate = plotData[0][0]

    const xScale = d3.scaleTime().domain([data[0].occurredDate, data[data.length - 1].occurredDate]).range([axisMargin, width - nonAxisMargin]) //domain is the time-data space, range is pixel space
    const yScale = d3.scaleLinear().domain([0, maxCount]).range([height - axisMargin, nonAxisMargin]) //domain is data space, range is pixel space

    const plotPoints = () => {

        const rects = plotData.map((incident, index) => {
            return (<svg key={index}>
                <rect
                    x={xScale(incident[0])}
                    y={yScale(incident[1])}
                    width={1}
                    height={height - axisMargin - yScale(incident[1])}
                    //stroke={'white'}
                    fill={'white'}>
                </rect>
            </svg >)
        })

        let points = []
        plotData.forEach((dateAndCount, index) => {
            let date = dateAndCount[0]
            let count = dateAndCount[1]

            for (let i = 1; i <= count; i++) {
                points.push(
                    <svg key={index + '-' + i}>
                        <circle
                            cx={xScale(date)}
                            cy={yScale(i)}
                            r={1}
                            fill={'white'}>
                        </circle>
                    </svg>)
            }
        })
        // return [...rects, ...points] // returns both for debugging
        return rects
    }
    console.log('Plot Rendering')
    if (data.length > 1) {
        return (<div>
            <svg width={width}
                height={height}>
                <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill="#202020"
                    rx={15} />
                {plotPoints()}
                <AxisLeft
                    left={axisMargin}
                    top={0}
                    labelOffset={30}
                    label={'# of UOF Incidents'}
                    scale={yScale}
                    stroke="white" tickStroke='white'
                    tickLabelProps={() => ({
                        fill: 'white',
                        fontSize: 14,
                        textAnchor: 'end',
                    })} />
                <AxisBottom
                    left={0}
                    top={height - axisMargin}
                    labelOffset={10}
                    label={'Date'}
                    scale={xScale}
                    stroke="white" tickStroke='white'
                    tickLabelProps={() => ({
                        fill: 'white',
                        fontSize: 14,
                        textAnchor: 'end',
                    })} />
            </svg>
        </div>)
    } else {
        return (<p></p>)
    }
}