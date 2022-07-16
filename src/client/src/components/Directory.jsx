import { Link } from "react-router-dom";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import scannerUrl from "./dapps/utils/scanner";

// const homeUrl = "http://localhost:4002/";
const homeUrl = "https://deaddrop-dapp-alpha.herokuapp.com";
function Directory(props) {
  let account = props.client.account;
  let web3Handler = props.web3Handler;
  let hasWeb3 = props.hasWeb3;
  return (
    <Navbar expand="lg" bg="secondary" variant="dark">
      <Container>
        <Navbar.Brand href={homeUrl}>
          <img
            src={process.env.PUBLIC_URL + "/images/logo192.png"}
            width="40"
            height="40"
            className=""
            alt="logo192"
          />
          &nbsp; Hemlock Street
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>

            {
              hasWeb3 && (
                <Nav.Link as={Link} to={hasWeb3 ? "/DeadDrop" : "/"}>
                  DeadDrop
                </Nav.Link>
              ) /*Contains Dapps*/
            }

            {/*!hasWeb3 && (
                    <Nav.Link as={Link} to="/dapps">Dapps & Web3</Nav.Link>
                  )*/
            /*Contains Requirements to View Dapps*/}

            <Nav.Link as={Link} to="/">
              Docs
            </Nav.Link>
            <Nav.Link as={Link} to="/">
              Contact
            </Nav.Link>
            <Nav.Link as={Link} to="/">
              About
            </Nav.Link>
          </Nav>
          <Nav>
            {account ? (
              <Nav.Link
                href={scannerUrl(props.client.chainId, props.client.account)}
                target="_blank"
                rel="noopener noreferrer"
                className="button nav-button btn-sm mx-4"
              >
                <Button variant="outline-light">
                  {account.slice(0, 5) + "..." + account.slice(38, 42)}
                </Button>
              </Nav.Link>
            ) : !hasWeb3 ? (
              <Button variant="warning" href="https://metamask.io/">
                Download Metamask
              </Button>
            ) : (
              <Button onClick={web3Handler} variant="outline-light">
                Connect Wallet
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Directory;
