import React from 'react'
import './index.css'
import data from './data'

import { AxisLeft, AxisBottom } from "@visx/axis";
import * as d3 from 'd3'


//console.log(data)

const months = [
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

	const chartSize = 630
	const margin = 30
	const legendPadding = 200
	const labelThreshold = 20

	// there is a problem when I set, it reruns the function so it just infinitely loops, but I cant access the data in the return otherwise because its outside of the .then
	//setViz(<p>Loaded</p>)

	//console.log(timeOrganizedData)
	//download(timeOrganizedData.toString(), 'json.json', 'text/plain');

	// sort by race to make it easier to see trends
	for (const year in data) {
		//console.log(year)
		const currentYear = data[year]
		for (const month in currentYear) {
			//console.log(month)
			const currentMonth = currentYear[month]
			for (const day in currentMonth) {
				//console.log(currentMonth[day])
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

	for (const year in data) {
		//console.log(year)
		const currentYear = data[year]
		for (const month in currentYear) {
			//console.log(month)
			const currentMonth = currentYear[month]
			for (const day in currentMonth) {
				//console.log(day)
				const currentDay = currentMonth[day]
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
					point.date = new Date(new Date(currentIncident.occuredDate).toDateString()); // this messiness gets rid of the time

					point.dayHeight = currentDay.length - 1

					//is the point the last one for that day?
					point.last = currentDay.length - 1 <= i
					return point
				})
				//console.log(year, month, day, incidentPoints)
				//append them to the points?
				points.push(...incidentPoints)
			}
		}
	}

	console.log(points)

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

	return (
		<div>
			<h1>Seattle Police Department Use-of-Force Incidents (2018-2022)</h1>
			<h2 class="y-axislabel">Incidents of Use-of-Force</h2>
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
					if (d.height > labelThreshold && d.last) { // if the height is above threshold, and its the last one for the day, and its taller than its neighbors.
						// the leftNeighbor will be far away, need to calculate with the height of ours.
						const leftNeighbor = points[i - d.dayHeight - 1]
						const rightNeighbor = points[i + 1]
						console.log('leftNeighbor', leftNeighbor)
						console.log('Me!', d)
						console.log('rightNeighbor', rightNeighbor)
						let leftNeighborHeight = leftNeighbor ? leftNeighbor.dayHeight : 0
						let rightNeighborHeight = rightNeighbor ? rightNeighbor.dayHeight : 0
						console.log(leftNeighborHeight)
						console.log(d.dayHeight)
						console.log(rightNeighborHeight)
						if (d.dayHeight > leftNeighborHeight && d.dayHeight > rightNeighborHeight) {
							return (
								<svg>
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
								</svg>
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
			<h2 class="x-axislabel">
				Date
			</h2>
			<div class="paragraphs">
				<div>
					<h3>Design Justification</h3>
					<p>The question I am interested in answering is: How are incidents of police use-of-force distributed through time, race and
						level or severity of force used?Because I have so many data points, and wanted to represent each individual incident of use-of-force, and show the accumulation</p>
				</div>
				<div>
					<h3>Data Transformation Description</h3>
					<p>To answer my question, certain fields for each datum were important for me to understand,
						these were the date, subjectRace and level of use-of-force. Because of the weight of the data density of each incident
						(time, race and level), the variation in time being really specific</p>
				</div>
				<div>
					<h3>Insights</h3>
					<p>The x-position vs y-position (amount of incidents per day), size and color of each dot are informative to answering different parts of my research question.</p>
				</div>
			</div>
		</div >
	)
}

export default App
