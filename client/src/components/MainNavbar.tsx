import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const MainNavbar: React.FC = () => {
  return (
    <Navbar expand="lg" style={{ backgroundColor: "#61ac85" }} variant="dark">
      <Container fluid>
        {/* App Name */}
        <Navbar.Brand as={Link} to="/" className="fw-bold text-white">
          Speak2Fit
        </Navbar.Brand>

        {/* Toggle Button for Mobile */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Navbar Links */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="text-white fw-bold mx-2">
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/exercise"
              className="text-white fw-bold mx-2"
            >
              Exercise
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/insights"
              className="text-white fw-bold mx-2"
            >
              Insights
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;
