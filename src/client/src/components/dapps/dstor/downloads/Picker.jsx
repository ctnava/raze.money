import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


function getYear(dateObject) { return dateObject.getFullYear() }
function getMonth(dateObject) { return dateObject.getMonth() }

const currentYear = getYear(new Date()); 
var years = [];
for (let i = 2020; i <= currentYear; i++) { years.push(i) }

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function Picker(props) {
  return(<div>
  <DatePicker
  renderCustomHeader={({
      date,
      changeYear,
      changeMonth
    }) => (
      <div
        style={{
          margin: 10,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <select
          value={getYear(date)}
          onChange={({ target: { value } }) => changeYear(value)}
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={months[getMonth(date)]}
          onChange={({ target: { value } }) =>
            changeMonth(months.indexOf(value))
          }
        >
          {months.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    )}
      selected={props.startDate}
      onChange={(date) => {
          props.onChange({
            target: { name: props.name, part: "start", selected: date }
          });
        }}
      selectsStart
      startDate={props.startDate}
      endDate={props.endDate}
      minDate={new Date("2020/03/13")}
      maxDate={new Date()}
    />
    <DatePicker
    renderCustomHeader={({
      date,
      changeYear,
      changeMonth
    }) => (
      <div
        style={{
          margin: 10,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <select
          value={getYear(date)}
          onChange={({ target: { value } }) => changeYear(value)}
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={months[getMonth(date)]}
          onChange={({ target: { value } }) =>
            changeMonth(months.indexOf(value))
          }
        >
          {months.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    )}
      selected={props.endDate}
      onChange={(date) => {
          props.onChange({
            target: { name: props.name, part: "end", selected: date }
          });
        }}
      selectsEnd
      startDate={props.startDate}
      endDate={props.endDate}
      minDate={props.startDate}
      maxDate={new Date()}
    />
  </div>);
}

export default Picker;