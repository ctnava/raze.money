import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNodes,
  faCubes,
  faRecycle,
} from "@fortawesome/free-solid-svg-icons";

function Principal(props) {
  const { title, expanded, detail, icon } = props.body;
  return (
    <Card as={Col}>
      <Card.Body>
        <FontAwesomeIcon icon={icon} size="4x" />
        <Card.Title>{title}</Card.Title>
        <h6>{expanded}</h6>
        <p>{detail}</p>
      </Card.Body>
    </Card>
  );
}

function DesignPrinciples() {
    const holistic = {
        icon: faCircleNodes,
        title: "Holistic Approach",
        expanded: "Tokens must have purpose",
        detail: "Tokens are a tool to receive funding; a resource used to build platforms. Platforms are tools to make things happen. Every contract comes with documentation."
    };
    const modularity = {
        icon: faRecycle,
        title: "Modular Contracts",
        expanded: "Always have a backup plan",
        detail: "Deployments cause stress on the network and raise gas prices. Our contracts minimize their impact by using predeployed modules; meaning guaranteed savings."
    };
    const perpetuity = {
        icon: faCubes,
        title: "Perpetual Operation",
        expanded: "No planned obsolescence",
        detail: "Gas is a precious resource. Every contract is designed to be forever operable and profitable. By default, they are even made to be trustlessly exchanged."
    };
  return (
    <section id="design">
      <Container fluid>
        <h1>Design Philosophy</h1>
        <Row lg={3}>
          <Principal body={holistic} />
          <Principal body={modularity} />
          <Principal body={perpetuity} />
        </Row>
      </Container>
    </section>
  );
}

export default DesignPrinciples;
