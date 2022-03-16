import React, { useState } from "react";

import * as dfd from "danfojs"
import * as d3 from 'd3'

import { Plot } from './Plot'
import { OfficerPlot } from './OfficerPlot'
import { Table } from './Table'
import { Map } from './Map'
import { Controller } from './Controller'

export function InteractiveDataViz(props) {
    const [controls, setControls] = useState({
        x: 'time',
        y: 'incident-count',
        filters: {
            race: ['White', 'Black or African American', 'Asian', 'Hispanic or Latino', 'Nat Hawaiian/Oth Pac Islander', 'American Indian/Alaska Native', 'Not Specified'],
            gender: ['Male', 'Female', 'Not Specified'],
            type: ['Level 1 - Use of Force', 'Level 2 - Use of Force', 'Level 3 - Use of Force', 'Level 3 - OIS'],
            precinct: ['North', 'East', 'West', 'South', 'Southwest', '-']
        },
        timeFrame: [undefined, undefined], //min-max
        plotType: 'officer',
    })
    let dataDF
    let cleanData
    let plotData


    let fullMax = 1
    let fullMin = 0

    const changeTimeFrame = (newTimeFrame) => {
        let updatedControls = { ...controls }
        updatedControls.timeFrame = newTimeFrame
        setControls(updatedControls)

    }

    const changePlotType = (newPlotType) => {
        let updatedControls = { ...controls }
        updatedControls.plotType = newPlotType
        setControls(updatedControls)

    }

    const toggleFilter = (type, filter) => {
        let updatedControls = { ...controls }
        let updatedFilters = updatedControls.filters
        if (type === 'race') {
            if (updatedFilters.race.includes(filter)) {
                updatedFilters.race.splice(updatedFilters.race.indexOf(filter), 1) // remove filter
            } else {
                updatedFilters.race.push(filter) // add filter
            }
        } else if (type === 'gender') {
            if (updatedFilters.gender.includes(filter)) {
                updatedFilters.gender.splice(updatedFilters.gender.indexOf(filter), 1) // remove filter
            } else {
                updatedFilters.gender.push(filter) // add filter
            }
        } else if (type === 'type') {
            if (updatedFilters.type.includes(filter)) {
                updatedFilters.type.splice(updatedFilters.type.indexOf(filter), 1) // remove filter
            } else {
                updatedFilters.type.push(filter) // add filter
            }
        } else if (type === 'precinct') {
            if (updatedFilters.precinct.includes(filter)) {
                updatedFilters.precinct.splice(updatedFilters.precinct.indexOf(filter), 1) // remove filter
            } else {
                updatedFilters.precinct.push(filter) // add filter
            }
        }
        updatedControls.filters = updatedFilters
        setControls(updatedControls) // send the update to state
    }


    if (props.data !== undefined && props.data.length > 0) {

        //Sort the data before converting!!!!
        //By time
        cleanData = props.data.sort((a, b) => a.UTC - b.UTC)

        //Get fullMax and fullMin
        fullMin = cleanData[0].UTC
        fullMax = cleanData[cleanData.length - 1].UTC

        //Filter before converting
        cleanData = cleanData.filter((incident) => {
            // Check Date against minimum
            if (controls.timeFrame[0] !== undefined) {
                if (controls.timeFrame[0] >= incident.UTC) { // if min date is larger than incident date
                    return false // kill it
                }
            }

            //Check date against maximum
            if (controls.timeFrame[1] !== undefined) {
                if (controls.timeFrame[1] <= incident.UTC) { // if max date is smaller than incident date
                    return false // kill it
                }
            }

            //Check race against filters
            if (!controls.filters.race.includes(incident.subjectRace)) { // if the filters dont include the race of incident
                return false // kill it
            }

            //Check gender against filters
            if (!controls.filters.gender.includes(incident.subjectGender)) { // if the filters dont include the race of incident
                return false // kill it
            }
            //Check Type against filters
            if (!controls.filters.type.includes(incident.incidentType)) { // if the filters dont include the race of incident
                return false // kill it
            }
            //Check location against filters
            if (!controls.filters.precinct.includes(incident.precinct)) { // if the filters dont include the race of incident
                return false // kill it
            }
            return true
        })

        cleanData = cleanData.map((incident) => {
            incident.simpleDate = new Date(incident.occurredDate.getYear() + 1900, incident.occurredDate.getMonth(), incident.occurredDate.getDate())
            return incident
        })

        dataDF = new dfd.DataFrame(cleanData)
        //  dataDF.tail().print()
        //Do group by?
        //TODO: make it grouped by date, officer or location for the three different types of charts
        const grpDate = dataDF.groupby(['simpleDate']) // could really just change this from date to location to officer
        const grpDateIncident = grpDate.col(['incidentNum'])
        const grpDateIncidentCount = grpDateIncident.count()
        //grpDateIncidentCount.print()
        plotData = grpDateIncidentCount.values
    }

    const display = () => {
        if (controls.plotType === 'plot') {
            return <Plot data={cleanData} dataFDF={dataDF} plotData={plotData} />
        } else if (controls.plotType === 'map') {
            return <Map cleanData={cleanData} dataFDF={dataDF} />
        } else if (controls.plotType === 'table') {
            return <Table data={cleanData} />
        } else if (controls.plotType === 'officer') {
            return <OfficerPlot data={cleanData} dataFDF={dataDF} />
        }
        return <></>
    }

    return (
        <>
            <div className='interactive-data-viz'>
                <Controller controls={controls} changeTimeFrame={changeTimeFrame} fullMin={fullMin} fullMax={fullMax} toggleFilter={toggleFilter} changePlotType={changePlotType} />
                <div>
                    {display()}
                </div>
            </div>

        </>)
}