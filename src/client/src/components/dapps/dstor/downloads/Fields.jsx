import React from 'react'
import { Row, Col, Button } from 'react-bootstrap'

function Fields(props) {
	const show = props.show;
    const setShow = props.setShow;

    function handleClick(event) {
        const name = event.target.name;
        const value = show[name];
        setShow({ ...show, [name]:!value });
    }

    function Field(props) {
        return(<Col><Button className="my-3" variant="secondary" name={props.name} onClick={handleClick}>{props.label}</Button></Col>);
    }

	return(<div>
        <Field name="fields" label="Fields" />
        { show.fields && (
        <Row>
            <Field name="name" label="Name" />
            <Field name="type" label="Extension" />
            <Field name="memo" label="Memo" />
            <Field name="size" label="Size" />
            <Field name="timestamp" label="Time" />
            <Field name="expiration" label="Expiration" />
            <Field name="from" label="Sender" />
            <Field name="to" label="Recipient" />
        </Row>
        )}
	</div>);
} 

export default Fields;