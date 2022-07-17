import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function Footer() {
  return (
    <footer>
      <Container fluid>
        <Row>
          <Col>
            <a href="#main" class="footer-link">
              Home
            </a>{" "}
            |{" "}
            <a href="#design" class="footer-link">
              Design Philosophy
            </a>{" "}
            |{" "}
            <a href="#products" class="footer-link">
              Products
            </a>{" "}
            |{" "}
            <a href="#services" class="footer-link">
              Services
            </a>{" "}
            |{" "}
            <a href="#contact" class="footer-link">
              Contact
            </a>
            <hr />
            <p>
              <span>
                RAZE.MONEY Copyright © 2022 L3GENDARY DAO - All Rights Reserved.
                || Icons courtesy of{" "}
              </span>
              <a href="https://fontawesome.com/" class="footer-link">
                FontAwesome
              </a>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
