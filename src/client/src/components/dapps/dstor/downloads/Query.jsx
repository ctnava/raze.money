import React from 'react';
// import Picker from './Picker';
import Sizer from './Sizer';
import { InputGroup, Form, DropdownButton, Dropdown, Row, Col, Button } from 'react-bootstrap' // eslint-disable-line no-unused-vars

function Query(props) {
    const query = props.query;
    const showQueryField = props.showQueryField;

    function handleClick(event) {
        const name = event.target.name;
        const value = showQueryField[name];
        props.setShowQueryField({...showQueryField, [name]:!value});
    }

    const allFieldsShown = (showQueryField.name && showQueryField.type && showQueryField.memo && showQueryField.hash && showQueryField.timestamp && showQueryField.size && showQueryField.from && showQueryField.to);
    return(<div>
        { !allFieldsShown ? (
        <DropdownButton variant="secondary" className="mb-3 my-3" title="Field Query">
            {!showQueryField.name && (<Dropdown.Item name="name" onClick={handleClick}>File Name</Dropdown.Item>)}
            {!showQueryField.type && (<Dropdown.Item name="type" onClick={handleClick}>File Type</Dropdown.Item>)}
            {!showQueryField.memo && (<Dropdown.Item name="memo" onClick={handleClick}>File Memo</Dropdown.Item>)}
            {!showQueryField.timestamp && (<Dropdown.Item name="timestamp" onClick={handleClick}>Timestamp</Dropdown.Item>)}
            {!showQueryField.expiration && (<Dropdown.Item name="expiration" onClick={handleClick}>Expiration</Dropdown.Item>)}
            {!showQueryField.size && (<Dropdown.Item name="size" onClick={handleClick}>File Size</Dropdown.Item>)}
            {!showQueryField.from && (<Dropdown.Item name="from" onClick={handleClick}>Sender Address</Dropdown.Item>)}
            {!showQueryField.to && (<Dropdown.Item name="to" onClick={handleClick}>Recipient Address</Dropdown.Item>)}
            <Dropdown.Divider />
            <Dropdown.Item onClick={props.resetQuery}>Reset All Fields</Dropdown.Item>
        </DropdownButton>) : (<Button onClick={props.resetQuery} variant="warning">Reset All Fields</Button>)}
        
        <Form>
        { showQueryField.name && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>File Name</InputGroup.Text>
                <Form.Control 
                type="text" 
                name="name"
                onChange={props.handleQuery} 
                placeholder="..."
                value={query.name}
                autoComplete="off"
                />
                <Button name="name" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group> 
        </div>) }

        { showQueryField.type && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>File Type</InputGroup.Text>
                <Form.Control 
                type="text" 
                name="type"
                onChange={props.handleQuery} 
                placeholder="..."
                value={query.type}
                autoComplete="off"
                />
                <Button name="type" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group> 
        </div>) }

        { showQueryField.memo && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>File Memo</InputGroup.Text>
                <Form.Control 
                type="text" 
                name="memo"
                onChange={props.handleQuery} 
                placeholder="..."
                value={query.memo}
                autoComplete="off"
                />
                <Button name="memo" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group>   
        </div>) }

        { showQueryField.timestamp && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>Timestamp</InputGroup.Text>{/*
                <Picker
                name="timestamp"
                startDate={query.timestamp.start}
                endDate={query.timestamp.end}
                onChange={props.handleDateQuery}
                />*/}
                <Button name="timestamp" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group>    
        </div>) }

        { showQueryField.expiration && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>Expiration</InputGroup.Text>{/*
                <Picker
                name="expiration"
                startDate={query.expiration.start}
                endDate={query.expiration.end}
                onChange={props.handleDateQuery}
                />*/}
                <Button name="expiration" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group>    
        </div>) }

        { showQueryField.size && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>File Size</InputGroup.Text>
                <Sizer query={props.query} handleSizeQuery={props.handleSizeQuery} />
                <Button name="size" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group>    
        </div>) }

        { showQueryField.from && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>Sender Address</InputGroup.Text>
                <Form.Control 
                type="text" 
                name="from"
                onChange={props.handleQuery}
                placeholder="..."
                value={query.from}
                autoComplete="off"
                />
                <Button name="from" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group>    
        </div>) }

        { showQueryField.to && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>Recipient Address</InputGroup.Text>
                <Form.Control 
                type="text" 
                name="to"
                onChange={props.handleQuery} 
                placeholder="..."
                value={query.to}
                autoComplete="off"
                />
                <Button name="to" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group>    
        </div>) } 
        </Form>
    </div>);
}

export default Query;