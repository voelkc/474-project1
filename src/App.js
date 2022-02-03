import React, { useEffect } from 'react'
import './index.css'
import data from './data'

import { AxisLeft, AxisBottom } from "@visx/axis";
import * as d3 from 'd3'
import * as dfd from "danfojs"

function App() {
	const chartSize = 315
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
						point.size = .5
					} else if (currentIncident.incidentType.includes('2')) {
						point.size = 1
					} else if (currentIncident.incidentType.includes('3')) {
						point.size = 1.5
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
	//console.log(dataArrayified)
	let dataDF = new dfd.DataFrame(dataArrayified)
	//dataDF.ctypes.print()
	dataDF.sortValues("occurredDate", { inplace: true })
	//dataDF.print()
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
	let whiteQuery = dataDF.query(dataDF['subjectRace'].eq('White'))
	let notSpecQuery = dataDF.query(dataDF['subjectRace'].eq('ZZZNot Specified'))
	let pocQuery = dataDF.query(dataDF['subjectRace'].ne('ZZZNot Specified').and(dataDF['subjectRace'].ne('White')))
	console.log(whiteQuery.shape)
	console.log(notSpecQuery.shape)
	console.log(pocQuery.shape)
	console.log(dataDF.shape) // so this looks right, data is cut significantly
	whiteQuery.print() // but here there are non-white entries showing up???
	notSpecQuery.print() // hmmmm
	pocQuery.print()
	//grpOfficer.print()


	// could probably do something involving the use of force for each officer as well

	// Plotting the danfo plots, should eventually make my own out of them because these dont look great/cohesive
	useEffect(() => {
		officerIncidentCount['incidentNum_count'].plot('plot_div').hist()
	}, [])


	/***************************************************************************************************************************************************************/

	return (
		<div>
			<h1>Seattle Police Department Use-of-Force Incidents Data Exploration</h1>
			<p>
				This data exploration takes a look at the Seattle Police Department's uses of force (use-of-forces or UOFs (sadly not UFOs)). Police
				brutality, especially against groups it disproportionately affects, has dominated national news, protests and movements for decades.
				This exploration dives deeper into SPD's relationship with police violence.  Data is sourced from the
				<a target="_blank" href="https://data.seattle.gov/Public-Safety/Use-Of-Force/ppi5-g2bj"> City of Seattle Open Data Program</a>.
			</p>

			<h2>Understanding the Data</h2>
			<p> The given CSV has 11 columns, describing the officer, subject (citizen involved), location, date & time, and degree of force used.
				Most of these fields are pretty self-explanatory, though some needed some research. Looking at the <code>Incident_Type</code> shows what level
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
			<p>It is worth noting that Level 3's in the dataset are accompanied by the acronym "OIS", which I believe is officer involved shooting.
				Its not clear how perfectly the definitions given, and the data entries map, but generally Level 1 is to aid in arrest, Level 2 is
				more liberal violence that can cause injury, and Level 3 is major bodily harm or lethal force.</p>
			<p>A potential issue I am seeing in the dataset is missing values. Automated values (like IDs), the officer ID and context values
				(time and place), are almost always available, sometimes lacking the more precise location data (possibly being due to overlapping
				location, confusing location or reporting officer being lazy). Values that are most likely to be missing are ones that describe the
				subject (race and gender), which makes it more difficult to find relationships regarding those factors. </p>
			<p>The table looks like this:</p>

			<div className='code-snippet'>
				<table>
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
				</table>
			</div>

			<h2>Question 1: What is the distribution of UOFs over time?</h2>

			<div className='horizontal-group'>
				<div style={{ marginLeft: "150px" }}>
					<p>The first transformation I made to this data, was to convert it from a CSV to a JSON <br />that I structured by time. I did this by looping
						through the csv, and adding entries to an array<br /> indexed first by year, then by month, and then by day. I did this in order to
						quickly create<br /> visualizations that looked at the distribution of UOFs over time. The data looks something like this:</p>
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
				<h2>Seattle Police Department Use-of-Force Incidents (2018-2022)</h2>
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
			</div>
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
				<div id="plot_div" style={{ 'width': '800px' }}></div>
				<p>
					There can be a lot of factors at play to describe some outliers, officers spend different amount of times in the force, in the field and differnt roles in that force.
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

			</div>
			<div>
				<h2>Group By Location, need a map key or something to understand better</h2>
				<p>The data is only precise to police structure location, not to actual GPS or spatial point. Would be great to do a chlorpleth, but would be difficult probably.</p>
			</div>

		</div >
	)
}

export default App
