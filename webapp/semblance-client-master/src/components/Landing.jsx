import React, { Component } from "react";
import { Jumbotron, Button } from "reactstrap";
import spyImage from "../images/landing-icon.png";

export default class extends Component {
  handleClick = () => {
    console.log(this.props.history)
    this.props.history.push("/train");
  };
  render() {
    return (
      <div className="landing">
        <div className="landing-image">
          <img className="spy-image" src={spyImage} alt="spy" />
        </div>
        <div className="landing-body">
          <Jumbotron>
            <h1 className="display-3">Spy on your students</h1>
            <hr className="my-2" />
            <p className="lead">Monitor and report attendance</p>
            <p className="lead">
              <Button color="primary" onClick={this.handleClick}>
                Get Started
              </Button>
            </p>
          </Jumbotron>
        </div>
      </div>
    );
  }
}
