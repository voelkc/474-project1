import React from 'react'
import './index.css'
import data from './data'

import { AxisLeft, AxisBottom } from "@visx/axis";
import * as d3 from 'd3'
import * as dfd from "danfojs"

function App() {
	const chartSize = 630
	const margin = 30
	const labelThreshold = 20

	// cut data down to just 2014-2022
	const cutData = [data['2018'], data['2019'], data['2020'], data['2021'], data['2022']]

	// sort by race to make it easier to see trends
	for (const year in data) {
		const currentYear = data[year]
		for (const month in currentYear) {
			const currentMonth = currentYear[month]
			for (const day in currentMonth) {
				currentMonth[day].sort(function (a, b) {
					var raceA = a.subjectRace.toUpperCase(); // ignore upper and lowercase
					var raceB = b.subjectRace.toUpperCase(); // ignore upper and lowercase
					if (raceA < raceB) {
						return -1;
					}
					if (raceA > raceB) {
						return 1;
					}
					return 0;
				});
			}
		}
	}

	let points = [] // made up of objects that have x pos (dependent on the amount in that day), y pos (dependent on day), color, size
	//populate points
	for (const year in cutData) {
		const currentYear = cutData[year]
		for (const month in currentYear) {
			const currentMonth = currentYear[month]
			for (const day in currentMonth) {
				const currentDay = currentMonth[day]
				const incidentPoints = currentDay.map((currentIncident, i) => {
					let point = {}
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
						point.color = 'rgb(170, 170, 170)' // grey
					}

					//gender
					if (currentIncident.subjectGender === 'Male') {
						point.gender = 'male'
					} else if (currentIncident.subjectGender === 'Female') {
						point.gender = 'female'
					} else { // not specified
						point.gender = 'none'
					}

					// incident position (height!), based on how many incidents are on thatday
					point.height = i

					//x position?
					point.date = new Date(new Date(currentIncident.occurredDate).toDateString()); // this messiness gets rid of the time

					point.dayHeight = currentDay.length - 1

					//is the point the last one for that day?
					point.last = currentDay.length - 1 <= i
					return point
				})
				//append them to the points?
				points.push(...incidentPoints)
			}
		}
	}


	let largestCount = 0;
	let firstDate = new Date() // now
	let lastDate = new Date("2005-3-17")

	points.forEach((d) => {
		if (d.height > largestCount) {
			largestCount = d.height
		}

		if (d.date > lastDate) {
			lastDate = d.date
		}

		if (d.date < firstDate) {
			firstDate = d.date
		}
	})

	const yScale = d3.scaleLinear().domain([0, largestCount]).range([chartSize - margin, margin]) //domain is data space, range is pixel space
	const xScale = d3.scaleTime().domain([firstDate, lastDate]).range([margin, chartSize * 3]) //domain is the time-data space, range is pixel space

	function legendCircle(x, y, size, color, text) {
		return (<svg>
			<circle
				cx={x + 5}
				cy={y}
				r={size}
				fill={color} />
			<text
				x={x + 10}
				y={y + 3}
				fill="white"
				fontSize={11}>
				{text}
			</text>
		</svg>)
	}


	function populateHeatmap() {
		let xPosition = 0 //determined by day of month
		let yPosition = 0 // determined by year/month
		let rectsToDisplay = [] //holds all the rectangles


		for (const year in data) {
			const currentYear = data[year]
			for (const month in currentYear) {
				const currentMonth = currentYear[month]
				xPosition = 0
				for (const day in currentMonth) {
					xPosition = parseInt(day) - 1

					let incidentsOnDay = currentMonth[day].length

					// max amount of incidents is around 130ish
					// show a lot as Red
					// show a low amount to 0 as green: 255 - 
					// around 10 should be like orangeish
					// run out of green

					rectsToDisplay.push(< rect
						x={xPosition * 15 + 2}
						y={yPosition * 15 + 2}
						height={15}
						width={15}
						stroke={'black'}
						fill={`rgb(${incidentsOnDay * 6}, ${0}, ${0})`}
					/>)
				}
				yPosition++;
			}
		}
		//return rectsToDisplay
		return rectsToDisplay
	}

	// Ok im done working with this janky object, lets try out danfo.js
	//Start by making a normal array.
	let dataArrayified = []
	for (const year in data) {
		const currentYear = data[year]
		for (const month in currentYear) {
			const currentMonth = currentYear[month]
			for (const day in currentMonth) {
				let currentDay = currentMonth[day]
				for (const incident of currentDay) {
					incident.occurredDate = new Date(new Date(incident.occurredDate).toDateString());
					dataArrayified.push(incident)
				}
			}
		}
	}
	console.log(dataArrayified)
	let dataDF = new dfd.DataFrame(dataArrayified)
	dataDF.ctypes.print()
	dataDF.sortValues("occurredDate", { inplace: true })
	dataDF.groupby('officerID')
	dataDF.print()






	/***************************************************************************************************************************************************************/

	return (
		<div>
			<h1>Seattle Police Department Use-of-Force Incidents Data Exploration</h1>
			<h2>Seattle Police Department Use-of-Force Incidents (2018-2022)</h2>
			<h3 className="y-axislabel">Incidents of Use-of-Force</h3>
			<svg
				width={chartSize * 3}
				height={chartSize}>

				<AxisLeft
					left={margin}
					scale={yScale}
					stroke="white" tickStroke='white'
					tickLabelProps={() => ({
						fill: 'white',
						fontSize: 11,
						textAnchor: 'middle',
					})} />
				<AxisBottom
					top={chartSize - margin}
					left={margin}
					scale={xScale}
					numTicks={30}
					tickStroke="white"
					stroke="white"
					labelClassName="label-text"
					//tickValues={months}
					tickLabelProps={() => ({
						fill: 'white',
						fontSize: 6,
						textAnchor: 'middle',
					})}
				/>
				{/* I have these to block out the smaller year labels :/ */}
				<rect
					x={45}
					y={chartSize - margin + 10}
					width={30}
					height={10}
					fill='black'
				/>

				<rect
					x={510}
					y={chartSize - margin + 10}
					width={30}
					height={10}
					fill='black'
				/>

				<rect
					x={973}
					y={chartSize - margin + 10}
					width={30}
					height={10}
					fill='black'
				/>

				<rect
					x={1435}
					y={chartSize - margin + 10}
					width={30}
					height={10}
					fill='black'
				/>

				<AxisBottom
					top={chartSize - margin}
					left={margin}
					scale={xScale}
					numTicks={4}
					tickStroke="white"
					stroke="white"
					labelClassName="label-text"
					tickLabelProps={() => ({
						fill: 'white',
						fontSize: 12,
						textAnchor: 'middle',
					})}
				/>
				<text
					x={chartSize - margin - 50}
					y={chartSize * 3 / 2}
					fill="red"
					fontSize={8}>
					Date
				</text>


				{points.map((d, i) => {
					if (d.height > labelThreshold && d.last) {
						const leftNeighbor = points[i - d.dayHeight - 1]
						const rightNeighbor = points[i + 1]
						let leftNeighborHeight = leftNeighbor ? leftNeighbor.dayHeight : 0
						let rightNeighborHeight = rightNeighbor ? rightNeighbor.dayHeight : 0
						if (d.dayHeight > leftNeighborHeight && d.dayHeight > rightNeighborHeight) {
							return (
								<g>
									<circle
										cx={xScale(d.date)}
										cy={yScale(d.height)}
										r={d.size}
										fill={d.color}
										style={{ opacity: .8 }} />
									<text
										x={xScale(d.date) - 8}
										y={yScale(d.height) - 3}
										fill="white"
										fontSize={8}
									>
										{d.date.getMonth().toString() + '/' + d.date.getDate()}
									</text>
								</g>
							)
						}
						return (<circle
							cx={xScale(d.date)}
							cy={yScale(d.height)}
							r={d.size}
							fill={d.color}
							style={{ opacity: .8 }} />)
					} else {
						return (<circle
							cx={xScale(d.date)}
							cy={yScale(d.height)}
							r={d.size}
							fill={d.color}
							style={{ opacity: .8 }} />)
					}

				})}
				{/*LEGEND*/}
				<rect
					y={margin}
					x={chartSize * 2.7}
					width={chartSize * .3}
					height={chartSize * .4 - 30}
					stroke="white" />
				<text
					x={chartSize * 2.7 + 10}
					y={margin + 20}
					fill="white"
					fontSize={18}>
					Legend
				</text>
				<text
					x={chartSize * 2.7 + 10}
					y={margin + 35}
					fill="white"
					fontSize={14}>
					Race
				</text>
				<text
					x={chartSize * 2.7 + 10}
					y={margin + 165}
					fill="white"
					fontSize={14}>
					Use-of-Force Severity
				</text>
				{legendCircle(chartSize * 2.7 + 10, margin + 50, 3, 'rgb(255, 0, 0)', 'Black')}
				{legendCircle(chartSize * 2.7 + 10, margin + 65, 3, 'rgb(0, 255, 0)', 'White')}
				{legendCircle(chartSize * 2.7 + 10, margin + 80, 3, 'rgb(0, 0, 255)', 'Asian')}
				{legendCircle(chartSize * 2.7 + 10, margin + 95, 3, 'rgb(255, 255, 0)', 'Hispanic or Latino')}
				{legendCircle(chartSize * 2.7 + 10, margin + 110, 3, 'rgb(255, 0, 255)', 'American Indian/Alaska Native')}
				{legendCircle(chartSize * 2.7 + 10, margin + 125, 3, 'rgb(0, 255, 255)', 'Nat Hawaiian/Oth Pac Islander')}
				{legendCircle(chartSize * 2.7 + 10, margin + 140, 3, 'rgb(170, 170, 170)', 'Not Specified')}
				{legendCircle(chartSize * 2.7 + 10, margin + 180, 1, 'rgb(170, 170, 170)', 'Level 1')}
				{legendCircle(chartSize * 2.7 + 10, margin + 195, 2, 'rgb(170, 170, 170)', 'Level 2')}
				{legendCircle(chartSize * 2.7 + 10, margin + 210, 3, 'rgb(170, 170, 170)', 'Level 3')}
			</svg>
			<h3 className="x-axislabel">
				Date
			</h3>
			<div style={{ 'marginTop': "50px", 'marginLeft': '30px' }}>
				<h2>Heatmap Time</h2>
				<svg width={31 * 15 + 4}
					height={(12 * 7 + 10) * 15 + 4}
					stroke="white">
					<rect
						width={31 * 15 + 4}
						height={(12 * 7 + 10) * 15 + 4}
						stroke="white" />v
					{populateHeatmap()}
					{ }
				</svg>
				<p>
					Hmm this is not very helpful. Its also too big and hard to read, doesn't do a great job of showing trends either, maybe shows when there are larger amounts of time. Maybe we do it by month. 12*9
				</p>
			</div>
			<div>
				<h2>Could do a barcode, but plotting the count of each day on each one...so many aggregates Could show generally how outliers work, and if there is a big space between them.</h2>
			</div>
			<div>
				<h2>Group By Office ID</h2>
			</div>
			<div>
				<h2>Group By Race</h2>
			</div>
			<div>
				<h2>Group By Location, need a map key or something to understand better</h2>
			</div>

		</div >
	)
}

export default App
