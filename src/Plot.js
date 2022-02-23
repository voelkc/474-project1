import React from "react";

import { AxisLeft, AxisBottom, AxisTop } from "@visx/axis";

import * as d3 from 'd3'

// Plots data coming from App's state. Can be dot plot, map, table....idk
// gives a key
// should be dynamic to the size of the web page
export function Plot(props) {
    const width = window.innerWidth - 255
    const height = window.innerHeight - 100
    const margin = 50
    console.log(window.innerWidth, window.innerHeight)

    const data = props.data
    const plotData = props.plotData

    //find max and min
    let maxCount = -1
    plotData.forEach((date) => {
        if (date[1] > maxCount) {
            maxCount = date[1]
        }
    })
    console.log(maxCount)
    let maxDate = plotData[plotData.length - 1][0]
    let minDate = plotData[0][0]

    const xScale = d3.scaleTime().domain([data[0].occurredDate, data[data.length - 1].occurredDate]).range([margin, width]) //domain is the time-data space, range is pixel space
    const yScale = d3.scaleLinear().domain([0, maxCount]).range([height - margin, 0]) //domain is data space, range is pixel space

    const plotPoints = () => {
        const rects = plotData.map((incident, index) => {
            return (<svg key={index}>
                <rect
                    x={xScale(incident[0])}
                    y={yScale(incident[1]) - margin}
                    width={0.1}
                    height={yScale(incident[1]) - margin - margin}
                    stroke={'white'}
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

        return points

    }

    if (data.length > 1) {
        return (<div>
            <svg width={width}
                height={height}
                stroke="white">
                <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill="#202020"
                    stroke="white" />
                {plotPoints()}
                <AxisLeft
                    left={margin}
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
                    top={height - margin}
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