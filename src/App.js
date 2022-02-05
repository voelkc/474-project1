import React, { useEffect } from 'react'
import './index.css'
import data from './data'

import { AxisLeft, AxisBottom, AxisTop } from "@visx/axis";
import { LinearGradient } from '@visx/gradient';
import * as d3 from 'd3'
import * as dfd from "danfojs"

import { Map } from './Map';
import { rgb } from 'd3';

function App() {
	const bigChartMultiplier = .70
	const chartSize = 630 * bigChartMultiplier
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
						point.size = 1 * bigChartMultiplier
					} else if (currentIncident.incidentType.includes('2')) {
						point.size = 2 * bigChartMultiplier
					} else if (currentIncident.incidentType.includes('3')) {
						point.size = 3 * bigChartMultiplier
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
				cx={x + 2.5}
				cy={y}
				r={size}
				fill={color} />
			<text
				x={x + 5}
				y={y + 1.5}
				fill="white"
				fontSize={5}>
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
					// around 10 should be like orange-ish
					// run out of green 

					rectsToDisplay.push(< rect
						x={xPosition * 10 + 2 + 50}
						y={yPosition * 10 + 2 + 50}
						height={10}
						width={10}
						stroke={'black'}
						fill={`rgb(${incidentsOnDay * 3}, ${0}, ${0})`}
					/>)
				}
				yPosition++;
			}
		}
		//return rectsToDisplay
		return rectsToDisplay
	}

	let makeGradient = () => {
		let gradientSteps = []
		for (let i = 0; i < 256; i++) {
			gradientSteps.push(<rect
				fill={`rgb(${i}, 0, 0)`}
				x={i * .5 + 386}
				y={80}
				width={.5}
				height={50}
				stroke='none'
			/>)
		}
		return gradientSteps
	}

	/*
const blueScale = d3.scaleLinear()
		.domain([0, maxIncidents])
		.range([255, 0])

	const redScale = d3.scaleLinear()
		.domain([0, maxIncidents])
		.range([0, 255])
	*/

	let makeGradient2 = () => {
		let gradientSteps = []
		for (let i = 0; i < 511; i++) {
			gradientSteps.push(<rect
				fill={`rgb(${i - 255}, 0, ${255 - i})`}
				x={i * .25 + 386}
				y={80}
				width={.5}
				height={50}
				stroke='none'
			/>)
		}
		return gradientSteps
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
	let dataDF = new dfd.DataFrame(dataArrayified)
	dataDF.sortValues("occurredDate", { inplace: true })
	let grpOfficer = dataDF.groupby(['officerID'])
	let grpOfficerIncident = grpOfficer.col(['incidentNum'])
	let officerIncidentCount = grpOfficerIncident.count()
	officerIncidentCount.sortValues('incidentNum_count', { inplace: true })

	// make a histogram of number of officers and the number of UOFs they have been involved in.
	// buckets should be groups of 10s (or maybe 5s) moving from 0(there will never be 0s) to 100

	// could filter on white, so then i see white and total, can calculate the ratio of white vs non-white UOF (not UFO sadly)
	//.addColumn()
	// i will need to removed all of the unspecified, then do white vs poc (maybe do white, vs poc vs nonspecified???)
	//so what is this?

	const whiteQuery = dataDF.query(dataDF['subjectRace'].eq('White'))
	const notSpecQuery = dataDF.query(dataDF['subjectRace'].eq('ZZZNot Specified'))
	const pocQuery = dataDF.query(dataDF['subjectRace'].ne('ZZZNot Specified').and(dataDF['subjectRace'].ne('White')))
	console.log(whiteQuery.shape)
	console.log(notSpecQuery.shape)
	console.log(pocQuery.shape)
	console.log(dataDF.shape) // so this looks right, data is cut significantly
	whiteQuery.print() // but here there are non-white entries showing up???
	notSpecQuery.print() // hmmmm
	pocQuery.print() // So basically the counts look right, so this should be ok....

	//Alright, lets do the group bys!
	const grpOfficerWhite = whiteQuery.groupby(['officerID'])
	const grpOfficerNotSpec = notSpecQuery.groupby(['officerID'])
	const grpOfficerPoc = pocQuery.groupby(['officerID'])

	const grpOfficerWhiteIncident = grpOfficerWhite.col(['incidentNum'])
	const grpOfficerNotSpecIncident = grpOfficerNotSpec.col(['incidentNum'])
	const grpOfficerPocIncident = grpOfficerPoc.col(['incidentNum'])

	const officerWhiteIncidentCount = grpOfficerWhiteIncident.count()
	const officerNotSpecIncidentCount = grpOfficerNotSpecIncident.count()
	const officerPocIncidentCount = grpOfficerPocIncident.count()

	//I can probably stack all these functions, but i have no idea what im doing rn

	const whiteData = officerWhiteIncidentCount.values
	const POCData = officerPocIncidentCount.values
	const notSpecData = officerNotSpecIncidentCount.values

	//Now i need to combine all of them, which will not be super fun :(
	let raceDataByOfficer = []
	for (let row of whiteData) { // white data is largest
		raceDataByOfficer.push({ officerID: row[0], whiteIncidents: row[1], pocIncidents: 0, unSpecIncidents: 0 })
	}
	console.log(raceDataByOfficer)
	for (const row of POCData) { // next largest
		let found = false
		let index = 0//looks like i need to do the index manually
		for (let expRow of raceDataByOfficer) {
			if (!found && expRow.officerID === row[0]) { //if we found the ID for the first time
				raceDataByOfficer[index].pocIncidents = row[1]
				found = true // we found it!
			}
			index++
		}

		if (!found) { // if we never found it in the existing data, it doesn't exist! So lets change that
			raceDataByOfficer.push({ officerID: row[0], whiteIncidents: 0, pocIncidents: row[1], unSpecIncidents: 0 })
		}
	}
	console.log(raceDataByOfficer)
	for (const row of notSpecData) { // now the smallest
		let found = false
		let index = 0//looks like i need to do the index manually
		for (let expRow of raceDataByOfficer) {
			if (!found && expRow.officerID === row[0]) { //if we found the ID for the first time
				raceDataByOfficer[index].unSpecIncidents = row[1]
				found = true // we found it!
			}
			index++
		}

		if (!found) { // if we never found it in the existing data, it doesn't exist! So lets change that
			raceDataByOfficer.push({ officerID: row[0], whiteIncidents: 0, pocIncidents: 0, unSpecIncidents: row[1] })
		}
	}
	console.log(raceDataByOfficer)

	//lets graph
	const graphRaceDifferenceByOfficer = (plotSize) => {
		const margin = 100
		const legendMargin = 70
		let max = 0
		for (const row of raceDataByOfficer) {
			if (row.whiteIncidents > max) {
				max = row.whiteIncidents
			}
			if (row.pocIncidents > max) {
				max = row.pocIncidents
			}
		}
		max = Math.ceil(max / 10) * 10;

		const whiteScale = d3.scaleLinear() //y
			.domain([0, max])
			.range([max * plotSize, 0])

		const pocScale = d3.scaleLinear() // x
			.domain([0, max])
			.range([margin, (max * plotSize) + margin])


		let points = raceDataByOfficer.map((officer) => {
			return (<circle
				cx={pocScale(officer.pocIncidents)}
				cy={whiteScale(officer.whiteIncidents)}
				r={plotSize / 3}
				opacity={.4}
				fill={'white'} />)
		})
		console.log(points.length)

		let line = (<line
			x1={margin}
			y1={plotSize * max}
			x2={officerPocIncidentCount.shape[0]}
			y2={-officerWhiteIncidentCount.shape[0]}
			stroke='cyan' />)

		return (<svg
			width={margin + (plotSize * max) + legendMargin}
			height={margin + plotSize * max}>
			<rect
				x={margin}
				y={0}
				width={max * plotSize}
				height={max * plotSize}
				fill={'none'}
			/>
			<AxisLeft
				left={margin}
				top={0}
				labelOffset={30}
				label={'# of UOF Incidents with White Subjects'}
				scale={whiteScale}
				stroke="white" tickStroke='white'
				tickLabelProps={() => ({
					fill: 'white',
					fontSize: 11,
					textAnchor: 'end',
				})} />
			<AxisBottom
				left={0}
				top={plotSize * max}
				labelOffset={30}
				label={'# of UOF Incidents with Non-White Subjects'}
				scale={pocScale}
				stroke="white" tickStroke='white'
				tickLabelProps={() => ({
					fill: 'white',
					fontSize: 11,
					textAnchor: 'end',
				})} />
			{points}
			<rect
				x={margin + plotSize * max}
				y={0}
				width={legendMargin}
				height={40}
				stroke={'white'}
				fill={'none'} />
			{/* {line} */}
			<text
				x={margin + plotSize * max + 4}
				y={18}
				fontSize={18}
				fill={'white'}>Legend</text>
			<circle
				cx={margin + plotSize * max + 6}
				cy={30}
				r={plotSize / 3}
				opacity={.4}
				fill={'white'} />
			<text
				x={margin + plotSize * max + 10}
				y={34}
				fontSize={10}
				fill={'white'}>SPD Officer</text>

		</svg>)
	}

	const graphNonSpecRaceByOfficer = (plotSize) => {
		const margin = 100
		const legendMargin = 70
		let max = 0
		let min = 100000000000
		for (const row of raceDataByOfficer) {
			//const ratio = row.whiteIncidents / row.pocIncidents
			// ratio or plus-minus
			const plusMinus = row.whiteIncidents - row.pocIncidents
			console.log(plusMinus)
			if (plusMinus > max) {
				max = plusMinus
			}
			if (plusMinus < min) {
				min = plusMinus
			}
		}
		console.log('MAX', max)
		console.log('MIN', min)
		max = Math.ceil(max / 10) * 10;
		min = (Math.ceil(min / 10) * 10) - 10;

		console.log('MAX', max)
		console.log('MIN', min)

		let maxUnSpec = 0
		for (const officer of raceDataByOfficer) {
			if (officer.unSpecIncidents > maxUnSpec) {
				maxUnSpec = officer.unSpecIncidents
			}
		}
		console.log(maxUnSpec)
		maxUnSpec = Math.ceil(maxUnSpec / 10) * 10;

		const plusMinusScale = d3.scaleLinear() //y
			.domain([min, max])
			.range([max * plotSize, 0])

		const pocScale = d3.scaleLinear() // x
			.domain([0, maxUnSpec])
			.range([margin, (max * plotSize) + margin])


		let points = raceDataByOfficer.map((officer) => {
			return (<circle
				cx={pocScale(officer.unSpecIncidents)}
				cy={plusMinusScale(officer.whiteIncidents - officer.pocIncidents)}
				r={plotSize / 3}
				opacity={.4}
				fill={'white'} />)
		})
		console.log(points.length)

		let dashedLine = (<line
			x1={(margin)}
			y1={max * plotSize / 2}
			x2={max * plotSize}
			y2={max * plotSize / 2} />) //idk  

		return (<svg
			width={margin + (plotSize * max) + legendMargin}
			height={margin + plotSize * max}>
			<rect
				x={margin}
				y={0}
				width={max * plotSize}
				height={max * plotSize}
				fill={'none'}
			/>
			<AxisLeft
				left={margin}
				top={0}
				fill={'white'}
				labelOffset={30}
				label={'White - Non-White Subjects'}
				scale={plusMinusScale}
				stroke="white" tickStroke='white'
				tickLabelProps={() => ({
					fill: 'white',
					fontSize: 11,
					textAnchor: 'end',
				})} />
			<AxisBottom
				left={0}
				top={plotSize * max}
				labelOffset={30}
				label={'# of UOF Incidents with "Race Not Specified" Subjects'}
				scale={pocScale}
				stroke="white" tickStroke='white'
				tickLabelProps={() => ({
					fill: 'white',
					fontSize: 11,
					textAnchor: 'end',
				})} />
			{points}
			<rect
				x={margin + plotSize * max}
				y={0}
				width={legendMargin}
				height={40}
				stroke={'white'}
				fill={'none'} />
			<text
				x={margin + plotSize * max + 4}
				y={18}
				fontSize={18}
				fill={'white'}>Legend</text>
			<circle
				cx={margin + plotSize * max + 6}
				cy={30}
				r={plotSize / 3}
				opacity={.4}
				fill={'white'} />
			<text
				x={margin + plotSize * max + 10}
				y={34}
				fontSize={10}
				fill={'white'}>SPD Officer</text>

		</svg>)
	}



	//Spatial Data time!!!
	// Group by beat
	let grpBeat = dataDF.groupby(['beat'])
	let grpBeatIncident = grpBeat.col(['incidentNum'])
	let grpBeatIncidentCount = grpBeatIncident.count()
	grpBeatIncidentCount.print()
	//lets color map it
	let beatArray = grpBeatIncidentCount.values
	// console.log(beatArray)

	//make the color scale

	// as incidents go up they go from blue to red
	// 600 is the middle-ish
	// 600 = 130 for both

	const maxIncidents = 600 // should make this a derived value instead of being bad.

	const blueScale = d3.scaleLinear()
		.domain([0, maxIncidents])
		.range([255, 0])

	const redScale = d3.scaleLinear()
		.domain([0, maxIncidents])
		.range([0, 255])

	const beatToPrecinct = (beat) => {
		if (beat.includes('N') || beat.includes('J') || beat.includes('L') || beat.includes('U') || beat.includes('B')) {
			return 'North'
		} else if (beat.includes('Q') || beat.includes('D') || beat.includes('K') || beat.includes('M')) {
			return 'West'
		} else if (beat.includes('C') || beat.includes('E') || beat.includes('G')) {
			return 'East'
		} else if (beat.includes('R') || beat.includes('S') || beat.includes('O')) {
			return 'South'
		} else if (beat.includes('F') || beat.includes('W')) {
			return 'Southwest'
		} // returns undefined if nothing else!
	}


	let beatFullData = beatArray.map((row) => {
		const beat = row[0]
		// let color = colorScale(row[1])
		const color = `rgb(${redScale(row[1])}, 0 , ${blueScale(row[1])})`
		const incidentCount = row[1]
		const precinct = beatToPrecinct(beat)
		return { beat, color, incidentCount, precinct }
		//TODO: Make Labels hide-able
	})
	console.log(beatFullData)

	let badMap = () => {

		let NorthHeight = 750
		let WestHeight = 750
		let EastHeight = 750
		let SouthHeight = 750
		let SouthWestHeight = 750

		const precincts = ['North', 'West', 'East', 'South', 'Southwest']

		const beatBars = beatFullData.map((beat) => {
			if (beat.precinct) {
				const label = beat.beat
				const height = beat.incidentCount / 6
				const xPosition = 60 + precincts.indexOf(beat.precinct) * 120
				const width = 60

				let fill
				let yPosition
				if (beat.precinct === 'North') {
					yPosition = NorthHeight
					NorthHeight = NorthHeight - height
					fill = 'purple'
				} else if (beat.precinct === 'West') {
					yPosition = WestHeight
					WestHeight -= height
					fill = 'orange'
				} else if (beat.precinct === 'East') {
					yPosition = EastHeight
					EastHeight -= height
					fill = 'yellow'
				} else if (beat.precinct === 'South') {
					yPosition = SouthHeight
					SouthHeight -= height
					fill = 'blue'
				} else if (beat.precinct === 'Southwest') {
					yPosition = SouthWestHeight
					SouthWestHeight -= height
					fill = 'green'
				}
				return (
					<g>
						<rect
							x={xPosition}
							y={yPosition - height}
							width={width}
							height={height}
							fill={'none'}
							stroke="white"
						/>
						<text
							x={xPosition + 20}
							y={6 + yPosition - height / 2}
							fill={"white"}
						>{label}</text>
					</g>)
			}
		})

		return (<div className='plot'>
			<svg height={890}
				width={650}>
				<text
					fill={'white'}
					fontSize={25}
					x={100}
					y={30}>UOF Incidents in SPD Precincts & Beats</text>

				<text
					fill={'white'}
					fontSize={20}
					transform={'rotate(-90, 15, 500)'}
					x={15}
					y={500}># of UOF Incidents</text>

				<text
					fill={'white'}
					fontSize={20}
					transform={'rotate(-50, 15, 860)'}
					x={15}
					y={860}>North Precinct</text>

				<text
					fill={'white'}
					fontSize={20}
					transform={'rotate(-50, 135, 860)'}
					x={135}
					y={860}>West Precinct</text>

				<text
					fill={'white'}
					fontSize={20}
					transform={'rotate(-50, 255, 860)'}
					x={255}
					y={860}>East Precinct</text>
				<text
					fill={'white'}
					fontSize={20}
					transform={'rotate(-50, 375, 860)'}
					x={375}
					y={860}>South Precinct</text>
				<text
					fill={'white'}
					fontSize={20}
					transform={'rotate(-50, 475, 890)'}
					x={475}
					y={890}>Southwest<br /> Precinct</text>

				<line
					x1={60}
					y1={750}
					x2={900}
					y2={750}
					stroke={'white'}
				/>
				<AxisLeft
					left={60}
					top={95}
					labelOffset={100}
					label={'UOF Incidents'}
					scale={d3.scaleLinear().domain([0, 4114]).range([655, 0])}
					stroke="white" tickStroke='white'
					tickLabelProps={() => ({
						fill: 'white',
						fontSize: 11,
						textAnchor: 'end',
					})} />
				{beatBars}
			</svg>
		</div>)
	}

	// could probably do something involving the use of force for each officer as well

	// Plotting the danfo plots, should eventually make my own out of them because these dont look great/cohesive
	useEffect(() => {
		officerIncidentCount['incidentNum_count'].plot('plot_div').hist()
	}, [])


	/***************************************************************************************************************************************************************/

	return (
		<div>
			<h1>Seattle Police Department Use-of-Force Incidents Data Exploration</h1>
			<p className='paragraph'>
				This data exploration takes a look at the Seattle Police Department's uses of force (use-of-forces or UOFs (sadly not UFOs)). Police
				brutality, especially against groups it disproportionately affects, has dominated national news, protests and movements for decades.
				This exploration dives deeper into SPD's relationship with police violence.  Data is sourced from the
				<a target="_blank" href="https://data.seattle.gov/Public-Safety/Use-Of-Force/ppi5-g2bj"> City of Seattle Open Data Program</a>.
			</p>

			<h2>Understanding the Data</h2>
			<p className='paragraph'> This data covers 2014-2022(gets updated everyday), I do not have it hooked up to an API call from the source, and am just dealing with a CSV. The given CSV has 11 columns, describing the officer, subject (citizen involved), location, date & time, and degree of force used.
				Most of these fields are pretty self-explanatory, though some needed some research. A potential issue I am seeing in the dataset is missing values. Automated values (like IDs), the officer ID and context values
				(time and place), are almost always available, sometimes lacking the more precise location data (possibly being due to overlapping
				location, confusing location or reporting officer being lazy). Values that are most likely to be missing are ones that describe the
				subject (race and gender), which makes it more difficult to find relationships regarding those factors. </p>
			<p>The table looks like this:</p>

			<div className='code-snippet'>
				<table>
					<thead>
						<tr>
							<th className='emphasis'>Field Name</th>
							<th>ID</th>
							<th>Incident_Num</th>
							<th>Incident_Type</th>
							<th>Occurred_date_time</th>
							<th>Precinct</th>
							<th>Sector</th>
							<th>Beat</th>
							<th>Officer_ID</th>
							<th>Subject_ID</th>
							<th>Subject_Race</th>
							<th>subjectGender</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className='emphasis'>Description</td>
							<td>Incident ID</td>
							<td>Other ID</td>
							<td>Degree of Force Used</td>
							<td>Incident Date/Time</td>
							<td>General Location</td>
							<td>More Specific Location</td>
							<td>Most Specific Location</td>
							<td>Officer ID</td>
							<td>Subject ID</td>
							<td>Race of Subject</td>
							<td>Gender of Subject</td>
						</tr>
						<tr>
							<td className='emphasis'>Data Type</td>
							<td>String</td>
							<td>Number</td>
							<td>Categorical String</td>
							<td>String {'->'} Date</td>
							<td>Categorical String</td>
							<td>Categorical String</td>
							<td>Categorical String</td>
							<td>Number</td>
							<td>Number</td>
							<td>Categorical String</td>
							<td>Categorical String</td>
						</tr>
						<tr>
							<td className='emphasis'>Example</td>
							<td>2014UOF-0001-1377-203</td>
							<td>251</td>
							<td>Level 1 - Use of Force</td>
							<td>06/07/2014 12:09:00 AM</td>
							<td>East</td>
							<td>CHARLIE</td>
							<td>C2</td>
							<td>1594</td>
							<td>203</td>
							<td>Black or African American</td>
							<td>Male</td>
						</tr>
					</tbody>
				</table>
			</div>

			<p className='paragraph' style={{ marginTop: '20px' }}>
				Looking at the <code>Incident_Type</code> shows what level
				of force was used during the UOF, but its not clear what each level means. From the
				<a href="https://www.seattle.gov/police-manual/title-8---use-of-force/8050---use-of-force-definitions" target="_blank"> SPD police manual</a> I found some appropriate definitions for these terms: </p>

			<div className='horizontal-group'>
				<div className='code-snippet left'>
					<p>
						<b>Type I</b> – Force that causes transitory pain or the complaint of transitory pain <br />
						Other examples include:<br />
						- Use of a hobble restraint<br />
						- Deployment of stationary tire deflation device with confirmed contact and deflation of tires<br />
						- Deployment of a blast ball away from people (bang-out), or<br />
						- Pointing a firearm at a person<br />
					</p>
				</div>

				<div className='code-snippet left'>
					<p>
						<b>Type II</b> – Force that causes or is reasonably expected to cause physical injury greater than transitory pain but less than great or substantial bodily harm.<br />
						The use of any of the following weapons or instruments is a Type II:<br />
						- TASER<br />
						- OC spray<br />
						- Impact weapon<br />
						- Deployment of a canine<br />
					</p>
				</div>

				<div className='code-snippet left'>
					<p>
						<b>Type III</b> – Force that causes or is reasonably expected to cause, great bodily harm, substantial bodily harm, loss of consciousness, or death. <br />
						The use of impact weapon strikes to the head is a Type III<br />
					</p>
				</div>
			</div>
			<p className='paragraph' >It is worth noting that Level 3's in the dataset are accompanied by the acronym "OIS", which I believe is officer involved shooting.
				Its not clear how perfectly the definitions given, and the data entries map, but generally Level 1 is to aid in arrest, Level 2 is
				more liberal violence that can cause injury ("less-than-lethal force"), and Level 3 is major bodily harm or lethal force.</p>

			<h2>Question 1: What is the distribution of UOFs over time?</h2>

			<div className='horizontal-group'>
				<div style={{ margin: 'auto', maxWidth: '600px' }}>
					<p className='paragraph'>The first transformation I made to this data, was to convert it from a CSV to a JSON that I structured by time. I did this by looping
						through the csv, and adding entries to an array indexed first by year, then by month, and then by day. This creates a tree-like structure.
						I did this in order to quickly create visualizations that looked at the distribution of UOFs over time. The data looks something like this:</p>
				</div>
				<div className='code-snippet left'>
					<p>
						"2014": &#123; <br />
						&ensp;"June": &#123;<br />
						&ensp;&ensp;"1": [&#123;<br />
						&ensp;&ensp;&ensp;"id": "2014UOF-0005-1473-172",<br />
						&ensp;&ensp;&ensp;"incidentNum": "223",<br />
						&ensp;&ensp;&ensp;"incidentType": "Level 1 - Use of Force",<br />
						&ensp;&ensp;&ensp;"occurredDate": "2014-06-01T23:03:00.000Z",<br />
						&ensp;&ensp;&ensp;"precinct": "South",<br />
						&ensp;&ensp;&ensp;"sector": "ROBERT",<br />
						&ensp;&ensp;&ensp;"beat": "R1",<br />
						&ensp;&ensp;&ensp;"officerID": "1145",<br />
						&ensp;&ensp;&ensp;"subjectID": "172",<br />
						&ensp;&ensp;&ensp;"subjectRace": "Black or African American",<br />
						&ensp;&ensp;&ensp;"subjectGender": "Male"&#125;,<br />
						&ensp;&ensp;...],<br />
						&ensp;...&#125;,<br />
						...&#125;,<br />
					</p>
				</div>
			</div>

			<div className='plot'>
				<h1>Seattle Police Department Use-of-Force Incidents (2018-2022)</h1>
				{/* <h2 className="y-axislabel">Incidents of Use-of-Force</h2> */}
				<svg
					width={chartSize * 3}
					height={chartSize + 20}>

					<AxisLeft
						left={margin}
						scale={yScale}
						label="# UOF Incidents" // so for some reason this is not showing up, even though it shows up in the page source and the chrome dev tools show that the styles are being applied too ????
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
						label="Month/Year"
						tickLabelProps={() => ({
							fill: 'white',
							fontSize: 6,
							textAnchor: 'middle',
						})}
					/>

					{points.map((d, i) => {
						if (d.height > labelThreshold && d.last) { // if the height is above threshold, and its the last one for the day, and its taller than its neighbors.
							// the leftNeighbor will be far away, need to calculate with the height of ours.
							const leftNeighbor = points[i - d.dayHeight - 1]
							const rightNeighbor = points[i + 1]
							let leftNeighborHeight = leftNeighbor ? leftNeighbor.dayHeight : 0
							let rightNeighborHeight = rightNeighbor ? rightNeighbor.dayHeight : 0
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
						height={chartSize * .5}
						fill={'none'}
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
						x={chartSize * 2.7 + 6}
						y={margin + 165}
						fill="white"
						fontSize={14}>
						Use-of-Force Level
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
			</div>
			<div className='horizontal-group'>
				<div>
					<h3>Dot Plot</h3>
					<p className='paragraph'>
						The above plot gives a pretty good ideas of how UOF incidents are shaped through time. Some constraints I needed to put on
						the graph was limiting the amount of time it covered (this only shows 2018-2022 when I had data from 2014 available), due
						to have a line of dots for every single day. While it is really helpful having race, level of severity and amount of incidents
						encoded on the same graph, it is too busy to identify clear trends in each category.
						<br />
						<br />
						Some initial issues I can already see with the data is there is a huge outlier during the Spring/Summer of 2020. There is a
						rough 100% rise in UOF incidents on some days during this time period. Because of the large disparity between normal data (which
						will have noticeable peaks above 20 incidents a day and are pretty notable), and this time period (where UOF incidents go over
						50 and even 100), it feels like I will need to make decisions to either leave the outlier data outside of the scale, or show very
						little variance in the data except for this specific event.
						<br />
						<br />
					</p>
					<h3>Heat Map</h3>
					<p className='paragraph'>
						My thinking was that the heat map would help focus on amount of incidents per day, and seeing trends in the incident count over time.
						I thought looking ast days of the months stacked on top of each other could be helpful in seeing trends that are based on beginning/
						middle/end of the month. Initial reactions to this plot are pretty underwhelming. It doesn't show any clear trends, and is really less
						helpful than the dot plot above. It can give a kinda weird nonlinear feeling towards the time, as opposed to a simple left-to-right
						orientation. It does clearly show the same trends as before though of a huge surge in UOFs in Spring/Summer 2020, as well as the lowering
						in UOF incidents in late 2021 (which I actually think is more clear because its less busy with other information!).
					</p>
					<br />
					<br />
					<h3>Conclusions</h3>
					<p className='paragraph'>
						General time related trends are not very apparent in the amount of UOF incidents that occur. There are event specific trends, which can
						be attributed to factors such as more protests and less police officers. There are a few strange instances where there are some
						recurrences of similar amounts of UOFs in some pattern involving time. Mayday (May 1st) has many more incidents in some years (especially
						mid-2010s), and there are weird spikes in late february in both 2018 and 2019. All of these trends are dwarfed by 2020 and 2021, which
						are outlier years in pretty much every facet anyway, so no surprise there.
					</p>
				</div>
				<div className='plot'>
					<svg width={31 * 10 + 4 + 50 + 160}
						height={(12 * 7 + 10) * 10 + 4 + 50}
						stroke="white">
						<rect
							x={50}
							y={50}
							width={31 * 10 + 4}
							height={(12 * 7 + 10) * 10 + 4}
							stroke="white" />
						{populateHeatmap()}
						<AxisTop
							top={50}
							left={20}
							scale={d3.scaleLinear().domain([0, 31]).range([30, 31 * 11])}
							numTicks={5}
							label={'Day of Month'}
							tickStroke="white"
							stroke="white"
							labelClassName="label-text"
							tickLabelProps={() => ({
								fill: 'white',
								fontSize: 12 * bigChartMultiplier,
								textAnchor: 'middle',
							})}
						/>
						<AxisLeft
							left={50}
							top={20}
							numTicks={50}
							label={'Month/Year'}
							scale={d3.scaleTime().domain([new Date('2014-06-01'), new Date('2022-01-04')]).range([30, (12 * 7 + 10) * 10 + 4 + 50])}
							stroke="white"
							tickStroke='white'
							tickLabelProps={() => ({
								fill: 'white',
								fontSize: 11,
								textAnchor: 'end',
							})} />
						<rect
							x={380}
							y={50}
							width={140}
							height={130}
							fill={'none'}
							stroke={'white'} />
						<text
							x={420}
							y={67}
							fill="white">
							Legend
						</text>
						{makeGradient()}
						<text
							x={390}
							y={145}
							fill="white">
							0
						</text>
						<line
							stroke="white"
							x1={405}
							y1={140}
							x2={495}
							y2={140} />
						<text
							x={500}
							y={145}
							fill="white">
							85
						</text>
						<text
							x={395}
							y={165}
							fill="white">
							# UOF Incidents
						</text>

					</svg>
				</div>
			</div>
			<div>
				<h2>Question 2: How are UOFs distributed throughout individual officers?</h2>
				<p className='paragraph'>
					Using the groupby function from danfo.js, I wanted to look at how each officer that is in this data set interacts with uses of force.
					A good place to start is looking at the total amount of UOFs for each police officer. I think this data can be dangerous, because it
					is unclear how many years each officer has spent in this department, how much time they spent in a role that is more likely to engage
					in UOFs, and other factors I can't think of. This data also only accounts for officers that have had at least one UOF, so if an officer
					has never had a UOF, they would not show up at all in this dataset, which is an important consideration to take in when looking at this,
					a better framing may be "For officers that have engaged in UOFs, this is how they engage in them". Either way this allows us to see what
					a typical amount of UOFs look like, and we should also be able to look at outliers with the highest amount of UOFs (which is fun because
					we love to blame individuals for systemic violence!)
				</p>
				<plot className='plot'>
					<div id="plot_div" style={{ 'width': '800px' }}></div>
				</plot>
				<h3>Histogram</h3>
				<p className='paragraph'>
					So looking at the amount of officers that are in each bin actually gives use a pretty clear shape. Most officers have had 2-3 UOFs, though
					a lot have had just 1 too. After these points, the distribution follows a pretty aggressive exponential slope into the large outliers,
					which are pretty crazy!
				</p>
				<div className="code-snippet">
					<p>
						╔═════╤═══════════╤══════════════════╗<br />
						║     │ officerID │incidentNum_count ║<br />
						╟─────┼───────────┼──────────────────╢<br />
						║ 862 │ 2099      │ 62               ║<br />
						╟─────┼───────────┼──────────────────╢<br />
						║ 581 │ 1604      │ 63               ║<br />
						╟─────┼───────────┼──────────────────╢<br />
						║ 718 │ 1750      │ 71               ║<br />
						╟─────┼───────────┼──────────────────╢<br />
						║ 639 │ 1665      │ 76               ║<br />
						╟─────┼───────────┼──────────────────╢<br />
						║ 94  │ 456       │ 93               ║<br />
						╚═════╧═══════════╧══════════════════╝<br />
					</p>
				</div>
				<div className='plot'>
					<h2>Officer # of UOFs involving White vs Non-White Subjects</h2>
					{graphRaceDifferenceByOfficer(8)}
				</div>
				<h3>White vs Non-White Subject Plot</h3>
				<p className='paragraph'>
					I took the same data as the histogram visualization, and ran some queries on it to get each officer's count on UOF's with white, non-white and
					race not-specified subjects. Plotting the white and non-white against each other allows us to see trends in the overall force and the individuals
					by seeing where they lie in the plot. Most points reside in the middle diagonal space, which shows a pretty even distribution, with a slight lean
					to having more white subjects of UOF. This makes sense because Seattle is about 60-65% white depending on metric (59.6% according to the&ensp;
					<a href="https://www.seattletimes.com/seattle-news/data/seattle-ranks-as-fifth-fastest-diversifying-big-city-of-the-decade/#:~:text=At%20the%20time%2C%2066%25%20of,the%20city's%20population%20is%20white." target="_blank">
						2020 census</a>). There are a few officers in each quadrant though, with those with high amounts of UOFs against white people, POCs and both (Officer 456).
				</p>

				<div className='plot'>
					<h2>Officer # of UOFs with Non-Specified Race <br /> Subjects vs Ratio of White/Non-White Subjects</h2>
					{graphNonSpecRaceByOfficer(14)}
				</div>
				<h3>White - Non-White Subjects vs. Non-Specified Race Subject</h3>
				<p className='paragraph'>
					So this plot is attempting to account for the high amounts of data I have where the race of the subject is not specified. I took each officers
					# of non-white UOF subjects, and subtracted it from the white ones. (positive number means more white subjects, negative number means more POC subjects).
					My thinking was looking at the difference between white and non-white subjects for each officer, and then their amount of non-specified subjects could
					show some hidden meaning in this mystery data. On first glance, it looks pretty all over the place, but there are a couple trends I can see. There is a large
					concentration of points in the upper left of the graph, which shows that there is a group of officers who had more UOFs involving white subjects could
					have around 5-12 non-specified race ones. There is another group in the lower middle, showing that there is a group of officers who disproportionately have
					more UOFs against POCs than white people (5-15 more), also have more non-specified subjects than those in the previous group with being more in the 10-20 range.
				</p>

				<h3>Conclusion</h3>
				<p className='paragraph'>
					I think this where some of my biases show in my expectations of this data. I thought there would be a more visible trend in disproportionate amounts of use of force
					against people of color, because in larger, national scales, this is the case. Based on race data of Seattle though, these numbers seem pretty appropriate, with maybe
					a slight overrepresentation for non-white subjects. I think the most interesting plot of this set is the final one, and here there are some theories one could get
					into to describe some more problematic behavior. With the first group I identified that had more UOFs with white subjects, and a sizable amount of unspecified UOFs,
					one could theorize that these cops would only report the race of their white subjects, and not the ones of color in order to avoid some oversight/punishment/extra
					training... One could also theorize that the group that had higher amounts of non-white subjects and a high amount of non-specified subjects are also racist in their
					behavior in that it is proven that they over target people of color with violence, and they also have a lot of UOF incidents where they did not report the race at
					all, again to avoid any punishment or looking too blatantly racist. I don't think I have enough information to prove one of these theories is wrong or right, or if
					this data can show anything like this at all. I do think the high amounts of unspecified race in the subjects of UOFs is a big problem though, because its easy to look
					at this data and prove whatever point you want to make (cops are racist or cops are not racist). For events like the Spring/Summer 2020 surge in UOFs, you can also see
					that there is a much higher amount of non-specified race in the data, while still having a pretty high report of white subjects, but not many non-whites. My anecdotal
					evidence of being at protests during this time, and seeing police engaging in UOF at these protests, was that there were definitely non-white people who had force used
					against them during their arrests or detaining, and I dont feel that this is accurately reported in this data.
				</p>

			</div>
			<div>
				<h2>How are UOF incidents spatially distributed?</h2>
				<p>The data is only precise to police structure location, not to actual GPS or spatial point. Would be great to do a choropleth, but would be difficult probably.</p>
				<p> Can use the data once with a stacked bar graph, and once again with the actual map, tell the story of how i went from bar graph to map to better show the spacial distribution</p>
			</div>
			{badMap()}
			<h3>Stacked Bar Chart (Bad Map)</h3>
			<p class='paragraph'>
				So because the data I was provided with does not hold lat and long points, it was not initially clear to me how I was going to show spatial relationships of this data,
				but I believed that this was an important relationship to show. The data I was provided with was location based on three different categories: Precinct, Sector and Beat.
				I did not even know what these meant at the beginning, but after looking into what they mean I found they are just geographic areas used by the police to organize themselves.
				Precincts are made up of sectors, which are made up of beats. Because spatial attributes can be reduced to categorical ones, I though I would make a bar graph to show these
				rough geographic relationships, and while I was making it I nick-named it the "bad map", because its like a map, but bad. The bad map shows which precincts have the higher amounts
				of UOFs, as well as which beats have higher amounts of UOFs.
			</p>
			<div className='plot'>
				<Map beatColors={beatFullData} />
			</div>
			<h3>Map</h3>
			<p class='paragraph'>
				Because the bad map was bad, I was not happy with it. So I made an actual map. The issue with making this map was that police geographical sections are not common place, and there
				is no existing way to simply show 321 UOFs in Beat O2 without having to make an entire map from scratch. So I downloaded the low quality image from the SPD website that showed
				how beats were distributed throughout the city, opened it in adobe illustrator, traced over it with SVG polygons, exported it into react, manually placed a style property in
				each beat (if I sound salty about this process its because it took 4 hours). Now that I had a map that could show the data, I needed to make the data work for the map,
				so I grouped the data by each beat and then counted the total amount  UOF cases from mid 2014 to now, mapped it to a color and this is what I got.
			</p>

			<h3>Conclusion</h3>
			<p class='paragraph'>
				The geographical data shows close to what you would expect. The largest amount of UOFs in any beat is E2, and this is by far, it has 1113 while the next highest has 502(Because I didn't want to skew the entire map, I scaled my data more around the 502 mark at the full red being 600). This is
				because this is where the most protesting went on in that Spring/Summer 2020 I keep talking about, <a href="https://www.foxnews.com/media/seattle-chop-violence-media-insisted-peaceful" target="_blank">this is also where the CHOP/CHAZ thing that you heard about on fox news was. </a>
				Aside from this outlier, there is a large amount of UOFs occurring in downtown Seattle, the M, D and K beats or the West Precinct. Something that was less clear in the bar chart, is the high amount of UOFs in South Seattle, because it is not made up of many beats, but each beat is pretty high.
			</p>

		</div >
	)
}

export default App
