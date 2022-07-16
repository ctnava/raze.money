import React from 'react';
import { InputGroup, Form, Button } from 'react-bootstrap' // eslint-disable-line no-unused-vars


function TimeExtension(props) {
    function quotedPrice() {
        const gasPdFloat = props.request.quote.gas / (10**18);
        const gpdString = gasPdFloat.toString();
        const fgpdString = gpdString.slice(0, gpdString.indexOf(".") + 9);

        const fiatPdFloat = props.request.quote.fiat / (10**8);
        const fpdString = fiatPdFloat.toString();
        const ffpdString = fpdString.slice(0, fpdString.indexOf(".") + 9);

        const gasQuote = gasPdFloat * props.request.days;
        const gqString = gasQuote.toString()
        const fgqString = gqString.slice(0, gqString.indexOf(".") + 9);

        const fiatQuote = fiatPdFloat * props.request.days;
        const fqString = fiatQuote.toString();
        const ffqString = fqString.slice(0, fqString.indexOf(".") + 9);
        return `Fee Total: $${ffqString} USD/ ${fgqString} Tokens (@ $${ffpdString} USD/ ${fgpdString} Tokens per day) THIS FEATURE WILL BE CUT`;
    }

    return(<div>
    <Form><Form.Group><InputGroup>
        <InputGroup.Text>{quotedPrice()}</InputGroup.Text>
        <Form.Control 
        type="number"
        name="days"
        min="1"
        onChange={event => {
            event.preventDefault();
            const syntheticEvent = { target: ["days", event.target.value] }
            props.handleChange(syntheticEvent);
        }} 
        value={props.request.days}
        />
        <InputGroup.Text>Additional Days</InputGroup.Text>
        <Button variant="secondary" onClick={props.handleClick}>Submit</Button>
    </InputGroup></Form.Group></Form>
    </div>);
}


export default TimeExtension;