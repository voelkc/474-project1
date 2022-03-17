import React from "react";

import { AxisLeft, AxisBottom, AxisTop } from "@visx/axis";
import * as dfd from "danfojs"
import * as d3 from 'd3'
import data from "./data";
import { area } from "d3";

export function OfficerPlot(props) {
    const size = (window.innerHeight - 100) / 2
    const margin = 30

    const data = props.data
    console.log(data)
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
                officers[incident.officerID] = { level1: 0, level2: 0, level3: 1, level4: 1, total: 1 }
            }
        }
    }
    console.log(officers)

    const areaToRadius = (area) => {
        let num = Math.sqrt(area)
        console.log(area)
        num = num / 3.14159 // pi ish
        num = num * 3 // scale it
        console.log(num)
        return num
    }

    const makePoints = () => {
        let points = []


        for (const [officerID, officerIncidents] of Object.entries(officers)) {
            console.log(officerIncidents)

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
        console.log(points)
        return points
    }
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

        console.log(propLowX, propHighX)
        const xDif = propHighX - propLowX
        console.log(xDif)
        console.log(propLowY, propHighY)
        const yDif = propHighY - propLowY
        console.log(yDif)



        // need to map -1 to margin, 0 to size-margin/2 and 1 to size-margin
        let myScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([margin, size - margin])

        let x = myScale(xDif)
        let y = myScale(yDif)


        return [x, y]

    }

    //grpOfficerTotal


    // grpOfficer.print()

    return (<div>
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

    </div >)
}