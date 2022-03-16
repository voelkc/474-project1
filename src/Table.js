import React from "react";

// Plots data coming from App's state. Can be dot plot, map, table....idk
// gives a key
// should be dynamic to the size of the web page
export function Table(props) {

    const makeTable = () => {
        if (props.data !== undefined && props.data.length > 0) {

            let displayData
            if (props.data.length > 100) {
                displayData = props.data.slice(0, 100)
            } else {
                displayData = props.data
            }
            const rows = displayData.map((incident, index) => {
                return (<tr key={index}>
                    <td>{incident.id}</td>
                    <td>{incident.incidentNum}</td>
                    <td>{incident.incidentType}</td>
                    <td>{`${incident.occurredDate.getMonth() + 1}/${incident.occurredDate.getDate()}/${incident.occurredDate.getYear() + 1900}`}</td>
                    <td>{incident.precinct}</td>
                    <td>{incident.sector}</td>
                    <td>{incident.beat}</td>
                    <td>{incident.officerID}</td>
                    <td>{incident.subjectID}</td>
                    <td>{incident.subjectRace}</td>
                    <td>{incident.subjectGender}</td>
                </tr>)
            })
            // console.log(rows)
            // console.log(typeof rows)
            return (<table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Incident Number</th>
                        <th>Incident Level</th>
                        <th>Date/Time</th>
                        <th>Precinct</th>
                        <th>Sector</th>
                        <th>Beat</th>
                        <th>Officer ID</th>
                        <th>Subject ID</th>
                        <th>Subject Race</th>
                        <th>Subject Gender</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>)
        } else {
            return <p>No Results</p>
        }
    }

    return (<div className='card-container'>
        {makeTable()}
    </div>)
}