import React, { useState } from 'react'
import './index.css'

import { Exploration } from './Exploration';
import { Plot } from './Plot'
import { InteractiveDataViz } from './InteractiveDataViz'
import data from './data';

const raw = data

function App() {
	const [dataTimeTree, setDataTimeTree] = useState(raw)

	let data = []

	for (const year in raw) {
		const currentYear = raw[year]
		for (const month in currentYear) {
			const currentMonth = currentYear[month]
			for (const day in currentMonth) {
				const currentDay = currentMonth[day]
				for (const incident of currentDay) {
					const date = new Date(incident.occurredDate)
					incident.occurredDate = date
					incident.UTC = date.getTime() + date.getTimezoneOffset() * 60000
					data.push(incident)
				}
			}
		}
	}
	console.log(data)
	// Well that did not work very well...Would be coool to get live data but alas
	// const fetchData = async () => {
	// 	const response = await fetch("https://data.seattle.gov/resource/ppi5-g2bj.json")
	// 	const resData = await response.json()
	// 	setData(resData)
	// }
	//
	// useEffect(() => {
	// 	fetchData()
	// }, [])

	return (<>
		<h1>Seattle Police Department Use-of-Force Data Visualization</h1>
		<InteractiveDataViz data={data} />
	</>)
}

export default App
