import AWS from "aws-sdk";
import React, { Component } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  FormGroup,
  Form,
  Input,
  Label,
  Row
} from "reactstrap";
import { withAlert } from "../util";
import shaka from "shaka-player";
import { sendReport } from "../api";
import "../css/monitor.css";

const streamName = "SemblanceLiveRekognitionVideoAnalysis";
const region = "us-west-2";

class Monitor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      playbackMode: "LIVE",
      startTimestamp: "",
      endTimestamp: "",
      accessKeyID: "",
      secretAccessKey: ""
    };
    this.player = React.createRef();
  }

  sendReport = () => {
    const email = this.state.email;
    sendReport(email)
      .then(() => {
        this.toggleAlert("info", "email sent");
      })
      .catch(err => this.toggleAlert("danger", err));
  };

  startMonitor = () => {
    const options = {
      accessKeyId: this.state.accessKeyID,
      secretAccessKey: this.state.secretAccessKey,
      sessionToken: undefined,
      region: region,
      endpoint: undefined
    };
    const kinesisVideo = new AWS.KinesisVideo(options);
    const kinesisVideoArchivedContent = new AWS.KinesisVideoArchivedMedia(
      options
    );
    const playerElement = this.player.current;
    const playbackMode = this.state.playbackMode;
    const startTimestamp = new Date(this.state.startTimestamp);
    const endTimestamp = new Date(this.state.endTimestamp);

    if (playbackMode === "ON_DEMAND") {
      this.toggleAlert(
        "danger",
        "Free acount does not support on demand streaming"
      );
    }

    kinesisVideo.getDataEndpoint(
      {
        StreamName: streamName,
        APIName: "GET_HLS_STREAMING_SESSION_URL"
      },
      function(err, response) {
        if (err) {
          return console.error(err);
        }
        console.log("Data endpoint: " + response.DataEndpoint);
        kinesisVideoArchivedContent.endpoint = new AWS.Endpoint(
          response.DataEndpoint
        );
        console.log("Fetching HLS Streaming Session URL");
        kinesisVideoArchivedContent.getHLSStreamingSessionURL(
          {
            StreamName: streamName,
            PlaybackMode: playbackMode,
            HLSFragmentSelector: {
              FragmentSelectorType: "SERVER_TIMESTAMP",
              TimestampRange:
                playbackMode === "LIVE"
                  ? undefined
                  : {
                      StartTimestamp: startTimestamp,
                      EndTimestamp: endTimestamp
                    }
            },
            DiscontinuityMode: "ALWAYS"
          },
          function(err, response) {
            if (err) {
              return console.error(err);
            }
            console.log(
              "HLS Streaming Session URL: " + response.HLSStreamingSessionURL
            );
            var player = new shaka.Player(playerElement);
            console.log("Created Shaka Player");
            player.load(response.HLSStreamingSessionURL).then(function() {
              console.log("Starting playback");
            });
            console.log("Set player source");
          }
        );
      }
    );
  };

  handleModeChnage = e => {
    this.setState({ playbackMode: e.target.value });
  };

  handleStartTimestampChange = e => {
    this.setState({ startTimestamp: e.target.value });
    console.log(e.target.value);
  };

  handleEndTimestampChange = e => {
    this.setState({ endTimestamp: e.target.value });
  };

  handleEmailChange = e => {
    this.setState({ email: e.target.value });
  };

  handleAccessKeyChange = e => {
    this.setState({ accessKeyID: e.target.value });
  };

  handleSecretKeyChange = e => {
    this.setState({ secretAccessKey: e.target.value });
  };

  toggleAlert = (type, message) => {
    this.props.toggleAlert(type, message);
  };

  render() {
    const isDateDisable = this.state.playbackMode === "LIVE" ? true : false;
    return (
      <Card className="monitor">
        <video ref={this.player} controls autoPlay />
        <CardBody>
          <Row form>
            <Col xm={6}>
              <FormGroup>
                <Label>ID</Label>
                <Input
                  type="password"
                  value={this.state.accessKeyID}
                  onChange={this.handleAccessKeyChange}
                />
              </FormGroup>
            </Col>
            <Col xm={6}>
              <FormGroup>
                <Label>Key</Label>
                <Input
                  type="password"
                  value={this.state.secretAccessKey}
                  onChange={this.handleSecretKeyChange}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row form>
            <Col xm={4}>
              <FormGroup>
                <Label>Mode</Label>
                <Input
                  type="select"
                  value={this.state.playbackMode}
                  onChange={this.handleModeChnage}
                >
                  <option value="LIVE">LIVE</option>
                  <option value="ON_DEMAND">ON_DEMAND</option>
                </Input>
              </FormGroup>
            </Col>
            <Col xm={4}>
              <FormGroup>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={this.state.startTimestamp}
                  max={this.state.endTimestamp}
                  onChange={this.handleStartTimestampChange}
                  disabled={isDateDisable}
                />
              </FormGroup>
            </Col>
            <Col xm={4}>
              <FormGroup>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={this.state.endTimestamp}
                  min={this.state.startTimestamp}
                  onChange={this.handleEndTimestampChange}
                  disabled={isDateDisable}
                />
              </FormGroup>
            </Col>
          </Row>
          <Button className="monitor-start" onClick={this.startMonitor}>
            Start Video
          </Button>
          <Form inline>
            <FormGroup>
              <Input
                type="email"
                placeholder="Email"
                value={this.state.email}
                onChange={this.handleEmailChange}
              />
            </FormGroup>
            <Button onClick={this.sendReport}>Send Report</Button>
          </Form>
        </CardBody>
      </Card>
    );
  }
}

export default withAlert(Monitor);
