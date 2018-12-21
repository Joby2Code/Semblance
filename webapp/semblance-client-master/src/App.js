import { library } from "@fortawesome/fontawesome-svg-core";
import { faChevronRight, faPen } from "@fortawesome/free-solid-svg-icons";
import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Monitor from "./components/Monitor";
import "./App.css";
import NavBar from "./components/NavBar";
import UploadList from "./components/UploadList";
import Landing from "./components/Landing";

library.add(faChevronRight, faPen);

class App extends Component {
  render() {
    return (
      <Router>
        <React.Fragment>
          <NavBar />
          <Route exact path="/" component={Landing} />
          <Route path="/train" component={UploadList} />
          <Route path="/monitor" component={Monitor} />
        </React.Fragment>
      </Router>
    );
  }
}

export default App;
