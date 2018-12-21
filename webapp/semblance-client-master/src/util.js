import React from "react";
import { Alert } from "reactstrap";

export const fileToBase64 = file => {
  return new Promise(resolve => {
    var reader = new FileReader();
    reader.onload = function(event) {
      resolve(event.target.result);
    };

    reader.readAsDataURL(file);
  });
};

export const withAlert = WrappedComponent => {
  class WithAlert extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        visible: false,
        type: "info",
        message: ""
      };

      this.onDismiss = this.onDismiss.bind(this);
    }

    onDismiss() {
      this.setState({ visible: false });
    }

    toggleAlert = (type, message) => {
      this.setState({ type, message, visible: true });
    };

    render() {
      return (
        <React.Fragment>
          <Alert
            id="global-alert"
            color={this.state.type}
            isOpen={this.state.visible}
            toggle={this.onDismiss}
          >
            {this.state.message}
          </Alert>
          <WrappedComponent toggleAlert={this.toggleAlert} {...this.props} />
        </React.Fragment>
      );
    }
  }
  WithAlert.displayName = `WithAlert(${getDisplayName(WrappedComponent)})`;
  return WithAlert;
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}
