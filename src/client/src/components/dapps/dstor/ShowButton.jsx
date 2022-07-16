import React from 'react'
import { Row, Button } from 'react-bootstrap'

function ShowButton(props) {
	return (
		<div>
			{!props.show && (
				<Row className="g-4 py-5">
					<Button 
					onClick={() => {props.setShow(true)}}
					>{props.message}</Button>
				</Row>)
			}
		</div>
		);
}

export default ShowButton;