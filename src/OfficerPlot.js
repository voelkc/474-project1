import React, { useState } from "react";

import { AxisLeft, AxisBottom, AxisTop, AxisRight } from "@visx/axis";
import * as dfd from "danfojs"
import * as d3 from 'd3'
import data from "./data";
import { area } from "d3";

export function OfficerPlot(props) {
    const [focusOfficer, setFocusOfficer] = useState(undefined)

    const size = (window.innerWidth - 255) / 2
    const margin = 30

    const data = props.data
    //console.log(data)
    let officers = {}
    for (const incident of data) {
        if (incident.officerID in officers) { // if the officer already exists
            if (incident.incidentType == 'Level 1 - Use of Force') {
                officers[incident.officerID].level1++
                officers[incident.officerID].total++
            } else if (incident.incidentType == 'Level 2 - Use of Force') {
                officers[incident.officerID].level2++
                officers[incident.officerID].total++
            } else if (incident.incidentType == 'Level 3 - Use of Force') {
                officers[incident.officerID].level3++
                officers[incident.officerID].total++
            } else { //level 3 Shooting!
                officers[incident.officerID].level4++
                officers[incident.officerID].total++
            }
        } else { // if the officer is new
            if (incident.incidentType == 'Level 1 - Use of Force') {
                officers[incident.officerID] = { level1: 1, level2: 0, level3: 0, level4: 0, total: 1 }
            } else if (incident.incidentType == 'Level 2 - Use of Force') {
                officers[incident.officerID] = { level1: 0, level2: 1, level3: 0, level4: 0, total: 1 }
            } else if (incident.incidentType == 'Level 3 - Use of Force') {
                officers[incident.officerID] = { level1: 0, level2: 0, level3: 1, level4: 0, total: 1 }
            } else { //level 3 Shooting!
                officers[incident.officerID] = { level1: 0, level2: 0, level3: 0, level4: 1, total: 1 }
            }
        }
    }
    //console.log(officers)

    const areaToRadius = (area) => {
        let num = Math.sqrt(area)
        //console.log(area)
        num = num / 3.14159 // pi ish
        num = num * 3 // scale it
        // console.log(num)
        return num
    }

    const makePoints = () => {
        let points = []
        for (const [officerID, officerIncidents] of Object.entries(officers)) {
            //console.log(officerIncidents)

            let coordinates = getXYPos(officerIncidents.level1, officerIncidents.level2, officerIncidents.level3, officerIncidents.level4, officerIncidents.total)
            points.push(
                <circle
                    cx={coordinates[0]}
                    cy={coordinates[1]}
                    r={areaToRadius(officerIncidents.total)}
                    fill={'white'}
                    opacity={.7}
                />
            )
        }
        // console.log(points)
        return points
    }

    let myScale = d3.scaleLinear()
        .domain([-1, 1])
        .range([margin, size - margin])

    const getXYPos = (levelOne, levelTwo, levelThree, levelFour, total) => {
        const min = margin
        const max = size - margin

        const prop1 = levelOne / total
        const prop2 = levelTwo / total
        const prop3 = levelThree / total
        const prop4 = levelFour / total

        const propLowX = prop1 + prop3
        const propHighX = prop2 + prop4

        const propLowY = prop1 + prop2
        const propHighY = prop3 + prop4

        // console.log(propLowX, propHighX)
        const xDif = propHighX - propLowX
        // console.log(xDif)
        // console.log(propLowY, propHighY)
        const yDif = propHighY - propLowY
        //console.log(yDif)



        // need to map -1 to margin, 0 to size-margin/2 and 1 to size-margin
        return [myScale(xDif), myScale(yDif)]
    }

    const constructOldPlot = () => {
        return (
            <div>
                <svg width={size}
                    height={size}>
                    <rect
                        x={0}
                        y={0}
                        width={size}
                        height={size}
                        fill="#202020"
                        rx={15} />
                    <rect
                        x={margin}
                        y={margin}
                        width={size - margin * 2}
                        height={size - margin * 2}
                        fill="#202020"
                        stroke="white" />
                    <line x1={size / 2} y1={margin} x2={size / 2} y2={size - margin} stroke={"white"} strokeDasharray="5" />
                    <line x1={margin} y1={size / 2} x2={size - margin} y2={size / 2} stroke={"white"} strokeDasharray="5" />
                    {makePoints()}
                    {/* <circle
                cx={size / 2}
                cy={size / 2}
                r={10}
                fill={'white'}
            /> */}
                    <text
                        x={20}
                        y={20}
                        fill={'white'}>Level 1</text>
                    <text
                        x={size - margin - 40}
                        y={20}
                        fill={'white'}>Level 2</text>
                    <text
                        x={20}
                        y={size - margin + 20}
                        fill={'white'}>Level 3 (Non-Shooting)</text>
                    <text
                        x={size - margin - 120}
                        y={size - margin + 20}
                        fill={'white'}>Level 3 (Shooting)</text>
                </svg>
            </div >
        )
    }

    const constructLevelPlot = () => {
        const officersAverageAndTotals = []
        let maxTotal = 0
        let maxAvg = 0
        for (const [officerID, officerIncidents] of Object.entries(officers)) {
            const average = (officerIncidents.level1 + (officerIncidents.level2 * 2) + (officerIncidents.level3 * 3) + (officerIncidents.level4 * 4)) / officerIncidents.total
            console.log(officerIncidents)
            console.log(average)
            officersAverageAndTotals.push({ officerID, average, total: officerIncidents.total })
            if (average > maxAvg) {
                maxAvg = average
            }
            if (officerIncidents.total > maxTotal) {
                maxTotal = officerIncidents.total
            }
        }
        console.log(maxTotal)
        console.log(maxAvg)

        const axisMargin = margin + 20

        const totalScale = d3.scaleLinear()
            .domain([0, maxTotal])
            .range([axisMargin, size - axisMargin])

        const averageScale = d3.scaleLinear()
            .domain([1, maxAvg])
            .range([size - axisMargin, axisMargin])

        const makePoints = () => {
            return officersAverageAndTotals.map((officer) => {
                return (
                    <circle
                        cx={totalScale(officer.total)}
                        cy={averageScale(officer.average)}
                        r={5}
                        opacity={.8}
                        fill={'white'}
                        onClick={() => { setFocusOfficer(officer.officerID) }}
                    />
                )
            })
        }

        return (
            <div
                style={{
                    fill: 'white',
                    textAnchor: 'end',
                }}
            >
                <svg width={size}
                    height={size}>
                    <rect
                        x={0}
                        y={0}
                        width={size}
                        height={size}
                        fill="#202020"
                        rx={15} />
                    <AxisLeft
                        left={axisMargin}
                        top={0}
                        labelOffset={20}
                        label={'Average Level of Force Used (Level 3 with Shooting is considered 4)'}
                        scale={averageScale}
                        stroke="white" tickStroke='white'
                        labelProps={() => ({
                            color: 'white',
                            fill: 'white',
                            fontSize: 14,
                            textAnchor: 'middle',
                        })}
                        tickLabelProps={() => ({
                            fill: 'white',
                            fontSize: 14,
                            textAnchor: 'end',
                        })} />
                    <AxisBottom
                        left={0}
                        top={size - axisMargin}
                        labelOffset={20}
                        label={'Total Number of Incidents'}
                        scale={totalScale}
                        stroke="white" tickStroke='white'
                        style={() => ({
                            fill: 'white',
                            fontSize: 14,
                        })}
                        labelProps={() => ({
                            color: 'white',
                            fill: 'white',
                            fontSize: 14,
                            textAnchor: 'middle',
                            style: {
                                fill: 'white',
                                fontSize: 14,
                            }
                        })}
                        tickLabelProps={() => ({
                            fill: 'white',
                            fontSize: 14,
                            textAnchor: 'middle',
                        })} />
                    {makePoints()}
                </svg>
            </div >
        )
    }

    const constructFocusPlot = () => {
        const displayFocusedOfficer = () => {
            if (focusOfficer !== undefined) { //show data
                console.log(officers[focusOfficer])
                const officer = officers[focusOfficer]
                const maxAmount = Math.max(officer.level1, officer.level2, officer.level3, officer.level4)
                console.log(maxAmount)
                const roundedMaxAmount = Math.ceil(maxAmount / 5) * 5

                const positionScale = d3.scaleLinear()
                    .domain([0, roundedMaxAmount])
                    .range([0, (size / 2) - 25])

                const otherPositionScale = d3.scaleLinear()
                    .domain([roundedMaxAmount, 0])
                    .range([0, (size / 2) - 25])

                const makeShape = () => {
                    const position = {
                        level1: positionScale(officer.level1),
                        level2: positionScale(officer.level2),
                        level3: positionScale(officer.level3),
                        level4: positionScale(officer.level4)
                    }
                    console.log(position)
                    return (<svg>
                        <circle //level 1
                            cy={size / 2 - position.level1}
                            cx={size / 2}
                            r={5}
                            fill={'white'}
                        />
                        <circle //level 2
                            cy={size / 2}
                            cx={size / 2 + position.level2}
                            r={5}
                            fill={'white'}
                        />
                        <circle //level 3
                            cy={size / 2 + position.level3}
                            cx={size / 2}
                            r={5}
                            fill={'white'}
                        />
                        <circle //level 3 with Shooting
                            cy={size / 2}
                            cx={size / 2 - position.level4}
                            r={5}
                            fill={'white'}
                        />
                        <polygon
                            points={`${size / 2}, ${size / 2 - position.level1} 
                            ${size / 2 + position.level2}, ${size / 2} 
                            ${size / 2}, ${size / 2 + position.level3} 
                            ${size / 2 - position.level4}, ${size / 2}`}
                            stroke={'white'}
                            fill={'white'}
                            opacity={.6}
                        />
                    </svg>)
                }


                return (<svg>
                    <text
                        x={20}
                        y={30}
                        fontSize={20}
                        textAnchor={'start'}>OfficerID: {focusOfficer}</text>
                    <line
                        x1={25}
                        y1={size / 2}
                        x2={size / 2}
                        y2={25}
                        stroke={'white'}
                    />
                    <line
                        x1={size / 2}
                        y1={25}
                        x2={size - 25}
                        y2={size / 2}
                        stroke={'white'}
                    />
                    <line
                        x1={size - 25}
                        y1={size / 2}
                        x2={size / 2}
                        y2={size - 25}
                        stroke={'white'}
                    />
                    <line
                        x1={size / 2}
                        y1={size - 25}
                        x2={25}
                        y2={size / 2}
                        stroke={'white'}
                    />
                    <text
                        x={size / 2}
                        y={20}
                        textAnchor='middle'
                        fill='white'>
                        Level 1
                    </text>
                    <text
                        x={20}
                        y={size / 2}
                        transform={`rotate(-90) translate(${- size / 2 - 10},${size / 2 - 10} )`}
                        textAnchor='middle'
                        fill='white'>
                        Level 2
                    </text>
                    <text
                        x={size / 2}
                        y={size - 10}
                        textAnchor='middle'
                        fill='white'>
                        Level 3 (Non-Shooting)
                    </text>
                    <text
                        x={20}
                        y={size / 2}
                        textAnchor='middle'
                        transform={`rotate(-90) translate(${- size / 2},${-size / 2 + 20} )`}
                        fill='white'>
                        Level 3 (Shooting)
                    </text>
                    <AxisLeft
                        left={size / 2}
                        top={25}
                        labelOffset={20}
                        scale={otherPositionScale}
                        stroke="white" tickStroke='white'
                        tickLabelProps={() => ({
                            fill: 'white',
                            fontSize: 14,
                            textAnchor: 'end',
                        })} />

                    <AxisRight
                        left={size / 2}
                        top={size / 2}
                        labelOffset={20}
                        scale={positionScale}
                        stroke="white"
                        tickStroke='white'
                        hideTickLabels={true}
                        tickLabelProps={() => ({
                            fontSize: 0,
                        })} />
                    <AxisBottom
                        left={25}
                        top={size / 2}
                        labelOffset={20}
                        scale={positionScale}
                        stroke="white"
                        tickStroke='white'
                        hideTickLabels={true}
                        tickLabelProps={() => ({
                            fontSize: 0,
                        })} />
                    <AxisTop
                        left={size / 2}
                        top={size / 2}
                        labelOffset={20}
                        scale={positionScale}
                        stroke="white"
                        tickStroke='white'
                        hideTickLabels={true}
                        tickLabelProps={() => ({
                            fontSize: 0,
                        })} />
                    <text
                        x={20}
                        y={60}>
                        Number of incidents within
                    </text>
                    <text
                        x={20}
                        y={80}>
                        each level of force category
                    </text>
                    {makeShape()}
                </svg>)
            } else {
                return (<text
                    x={size / 2}
                    y={size / 2}
                    textAnchor={'middle'} > Click on a point to focus on that officer.</text >)
            }
        }

        return (
            <div
                style={{
                    fill: 'white',
                }}>
                <svg width={size}
                    height={size}>
                    <rect
                        x={0}
                        y={0}
                        width={size}
                        height={size}
                        fill="#202020"
                        rx={15} />
                    {displayFocusedOfficer()}
                </svg>
            </div>
        )
    }

    return (<div className='officer-plots'>
        {constructLevelPlot()}
        {constructFocusPlot()}
    </div>)
}