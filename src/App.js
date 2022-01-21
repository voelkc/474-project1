import React, { useState } from 'react'
import './index.css'
import data from './data'

import * as d3 from 'd3'

console.log(data)

// console.log('helo')
// let aDay = new Date("2014-04-02T07:58:00.000Z")
// console.log(aDay)



const month = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'June',
	'Jul',
	'Aug',
	'Sept',
	'Oct',
	'Nov',
	'Dec',
]

function App() {
	const [viz, setViz] = useState(<p>Loading...</p>)

	const chartSize = 600
	const margin = 30
	const legendPadding = 200

	// there is a problem when I set, it reruns the function so it just infinitely loops, but I cant access the data in the return otherwise because its outside of the .then
	//setViz(<p>Loaded</p>)

	//console.log(timeOrganizedData)
	//download(timeOrganizedData.toString(), 'json.json', 'text/plain');

	let points = [] // made up of objects that have x pos (dependent on the amount in that day), y pos (dependent on day), color, size

	for (const year in data) {
		//console.log(year)
		const currentYear = data[year]
		for (const month in currentYear) {
			//console.log(month)
			const currentMonth = currentYear[month]
			for (const day in currentMonth) {
				//console.log(day)
				const currentDay = currentMonth[day]
				//for (const incident in currentDay) {
				const incidentPoints = currentDay.map((currentIncident, i) => {
					let point = {}
					//console.log(currentIncident)
					//"2014-04-02T07:58:00.000Z"

					//size
					if (currentIncident.incidentType.includes('1')) {
						point.size = 1
					} else if (currentIncident.incidentType.includes('2')) {
						point.size = 2
					} else if (currentIncident.incidentType.includes('3')) {
						point.size = 3
					}

					//color
					if (currentIncident.subjectRace === 'Black or African American') {
						point.color = 'rgb(255, 0, 0)' // red
					} else if (currentIncident.subjectRace === 'White') {
						point.color = 'rgb(0, 255, 0)' // green
					} else if (currentIncident.subjectRace === 'Asian') {
						point.color = 'rgb(0, 0, 255)' // blue
					} else if (currentIncident.subjectRace === 'Hispanic or Latino') {
						point.color = 'rgb(255, 255, 0)' // yellow?
					} else if (currentIncident.subjectRace === 'American Indian/Alaska Native') {
						point.color = 'rgb(255, 0, 255)' // purple?
					} else if (currentIncident.subjectRace === 'Nat Hawaiian/Oth Pac Islander') {
						point.color = 'rgb(0, 255, 255)' // teal?
					} else { // not specified?
						point.color = 'rgb(200, 200, 255)' // grey
					}

					//gender
					if (currentIncident.subjectGender === 'Male') {
						point.gender = 'male'
					} else if (currentIncident.subjectGender === 'Female') {
						point.gender = 'female'
					} else { // not specified
						point.gender = 'none'
					}

					// incident position (height!)
					point.yPosition = i

					point.date = new Date(currentIncident.occuredDate)

					//point.xPosition = currentIncident.occuredDate.getFullYear() % 4 == 0 ? 366 : 365;
					//"2014-04-02T07:58:00.000Z"
					let day = Date.parse(currentIncident.occuredDate)
					//console.log(typeof day)
					// console.log(currentIncident.occuredDate)
					// console.log((day / 10000) - 140166378)
					//var days = new Date().getFullYear() % 4 == 0 ? 366 : 365;

					return point
				})
				console.log(year, month, day, incidentPoints)
			}
		}
	}


	// loop through all of the months
	// for (const year in timeOrganizedData) {
	//   const setYear = timeOrganizedData[year];
	//   for (const month in setYear) {
	//     console.log(year, month, setYear[month].length);
	//   }
	// }

	return (
		<div>
			<h1>Seattle Police Department Use-of-Force Incidents</h1>
			<svg
				width={chartSize * 2}
				height={chartSize}
				style={{ border: "2px solid white" }}>

			</svg>
		</div >
	)
}

export default App
