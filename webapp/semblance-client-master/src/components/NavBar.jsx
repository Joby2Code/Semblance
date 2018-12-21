import React from "react";
import { Link } from "react-router-dom";
import { Nav, Navbar, NavItem } from "reactstrap";

const NavBar = () => {
  return (
    <React.Fragment>
      <Navbar className="navbar">
        <Link className="navbar-brand nav-link" to="/">
          Semblance
        </Link>
        <Nav>
          <NavItem>
            <Link className="nav-link" to="/train">
              Train
            </Link>
          </NavItem>
          <NavItem>
            <Link className="nav-link" to="/monitor">
              Monitor
            </Link>
          </NavItem>
        </Nav>
      </Navbar>
    </React.Fragment>
  );
};

export default NavBar;
