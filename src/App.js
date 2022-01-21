import React, { useState } from 'react'
import './index.css'

import * as d3 from 'd3'

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

	d3.csv(
		'https://gist.githubusercontent.com/voelkc/8023c515a5289e436f0082d48cad2758/raw/4e460972ba1d629e6c3945962f93ddedae760f18/use-of-force.csv',
		function (d) {
			return {
				id: d.ID,
				incidentNum: d.Incident_Num,
				occuredDate: new Date(d.Occured_date_time),
				precinct: d.Precinct,
				sector: d.Sector,
				beat: d.Beat,
				officerID: d.Officer_ID,
				subjectID: d.Subject_ID,
				subjectRace: d.Subject_Race,
				subjectGender: d.Subject_Gender,
			}
		}
	).then(function (data) {
		// put the viz here?
		//aggregate the months/years
		let timeOrganizedData = {}
		data.forEach((incident) => {
			const incYear = incident.occuredDate.getFullYear()
			const incMonth = month[incident.occuredDate.getMonth()]
			const incDay = incident.occuredDate.getDate()
			//console.log(incYear, incMonth, incDay);

			if (incYear in timeOrganizedData) {
				if (incMonth in timeOrganizedData[incYear]) {
					if (incDay in timeOrganizedData[incYear][incMonth]) {
						timeOrganizedData[incYear][incMonth][incDay].push(incident) // add this incident to the list for this month
					} else {
						timeOrganizedData[incYear][incMonth][incDay] = [incident] // adds a new list with just this incident
					}
				} else {
					timeOrganizedData[incYear][incMonth] = {}
					timeOrganizedData[incYear][incMonth][incDay] = [incident] // adds a new list with just this incident
				}
			} else {
				timeOrganizedData[incYear] = {}
				timeOrganizedData[incYear][incMonth] = {}
				timeOrganizedData[incYear][incMonth][incDay] = [incident] // adds a new list with just this incident
			}
		})
		//setViz(<p>Loaded</p>)
		console.log(timeOrganizedData)

		// loop through all of the months
		// for (const year in timeOrganizedData) {
		//   const setYear = timeOrganizedData[year];
		//   for (const month in setYear) {
		//     console.log(year, month, setYear[month].length);
		//   }
		// }
	})

	return (
		<div>
			<h1>Seattle Police Department Use-of-Force Incidents</h1>
			{viz}
		</div>
	)
}

export default App
