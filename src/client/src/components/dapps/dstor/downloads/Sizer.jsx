import React from 'react';
import Select from 'react-select';
import { Form, InputGroup } from 'react-bootstrap';

const units = [
    { label: 'bytes', value: 'bytes' },
    { label: 'KB', value: 'KB' },
    { label: 'MB', value: 'MB' },
    { label: 'GB' , value: 'GB' },
    { label: 'TB' , value: 'TB' },
    { label: 'PB' , value: 'PB' },
    { label: 'EB' , value: 'EB' },
    { label: 'ZB' , value: 'ZB' },
    { label: 'YB' , value: 'YB' }
];

function Sizer(props){
    return(<div>
        <Form.Control 
        type="number" 
        name="min"
        min="0"
        max={parseInt(props.query.size.max)-1}
        onChange={props.handleSizeQuery} 
        value={props.query.size.min}
        />
        <InputGroup.Text>to</InputGroup.Text>
        <Form.Control 
        type="number" 
        name="max"
        min={parseInt(props.query.size.min)+1}
        max="1024"
        onChange={props.handleSizeQuery}
        value={props.query.size.max}
        />
        <Select 
        options={units} 
        onChange={(choice) => {
            const event = {
                target: {
                    name: "units",
                    value: choice.value
                } 
            };
            props.handleSizeQuery(event);
        }}
        />
    </div>);
}

export default Sizer;