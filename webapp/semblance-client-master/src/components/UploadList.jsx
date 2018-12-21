import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, Col, Input, Row } from "reactstrap";
import { trainImages } from "../api";
import { withAlert } from "../util";
import "../css/upload-list.css";

const UploadHeader = ({ uploadImages }) => (
  <div className="upload-list-header clearfix">
    <span className="upload-list-header-text">Training Data</span>
    <Button className="upload-list-upload" onClick={uploadImages}>
      Start to train
    </Button>
  </div>
);

const StudentItem = ({ name, netID, removeStudent }) => (
  <div className="students-item">
    <div className="students-item-icon">{(name[0] || " ").toUpperCase()}</div>
    <div className="students-item-content">
      <div className="students-item-title">{name}</div>
      <div className="students-item-sub">{netID}</div>
    </div>
    <div className="students-item-action">
      <Button
        className="students-item-action-btn"
        color="danger"
        onClick={removeStudent.bind(null, netID)}
      >
        Remove
      </Button>
    </div>
  </div>
);

const NewStudentRowIdle = ({ onClick }) => (
  <div className="students-item students-new-row-idle" onClick={onClick}>
    <div className="students-item-icon">+</div>
    <div className="students-item-content students-add-member">
      <div className="students-item-title">Add a new student</div>
    </div>
    <div className="students-item-action">
      <div className="students-chevron-ctn">
        <FontAwesomeIcon icon="chevron-right" />
      </div>
    </div>
  </div>
);

const NewStudentRowActive = ({
  addStudent,
  netID,
  name,
  handleNewStudentNameChange,
  handleNewStudentNetIdChange,
  file
}) => (
  <form className="students-item" onSubmit={addStudent}>
    <div className="students-item-icon students-item-icon-edit">
      <FontAwesomeIcon icon="pen" />
    </div>
    <Row>
      <Col xs={4}>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={handleNewStudentNameChange}
          required
        />
      </Col>
      <Col xs={4}>
        <Input
          type="text"
          placeholder="NetId"
          value={netID}
          onChange={handleNewStudentNetIdChange}
          required
        />
      </Col>
      <Col xs={4}>
        <Input
          innerRef={file}
          type="file"
          accept="image/jpeg,image/png"
          required
        />
      </Col>
    </Row>
    <span className="students-item-input-spacing" />
    <div className="students-item-action">
      <Button className="students-item-action-btn" type="submit">
        Add
      </Button>
    </div>
  </form>
);

class UploadList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAddActive: false,
      newStudentName: "",
      newStudentNetID: "",
      students: []
    };
    this.file = React.createRef();
  }

  toggleAlert = (type, message) => {
    this.props.toggleAlert(type, message);
  };

  toggleNewRowActive = () =>
    this.setState(prevState => ({ isAddActive: !prevState.isAddActive }));

  handleNewStudentNameChange = e =>
    this.setState({ newStudentName: e.target.value });

  handleNewStudentNetIdChange = e =>
    this.setState({ newStudentNetID: e.target.value });

  addStudent = e => {
    e.preventDefault();
    const netID = this.state.newStudentNetID;
    if (this.state.students.some(student => student.netID === netID)) {
      return this.toggleAlert("danger", "Student already exists");
    }
    const name = this.state.newStudentName.replace(" ", "_");
    const file = this.file.current.files[0];
    const exts = file.name.split(".");
    const ext = exts[exts.length - 1];
    const blob = file.slice(0, file.size, file.type);
    const newFile = new File([blob], `${name}_${netID}.${ext}`, {
      type: file.type
    });
    const newStudent = {
      name,
      netID,
      file: newFile
    };
    this.setState(state => ({
      students: [...state.students, newStudent],
      newStudentName: "",
      newStudentNetID: ""
    }));
    this.toggleNewRowActive();
  };

  removeStudent = netID => {
    this.setState(state => ({
      students: state.students.filter(student => student.netID !== netID)
    }));
  };

  uploadImages = () => {
    trainImages(this.state.students);
    this.setState({ students: [] });
  };

  render() {
    const students = this.state.students;
    return (
      <div className="upload-list">
        <UploadHeader uploadImages={this.uploadImages} />
        {this.state.isAddActive ? (
          <NewStudentRowActive
            name={this.state.newStudentName}
            netID={this.state.newStudentNetID}
            file={this.file}
            addStudent={this.addStudent}
            handleNewStudentNameChange={this.handleNewStudentNameChange}
            handleNewStudentNetIdChange={this.handleNewStudentNetIdChange}
          />
        ) : (
          <NewStudentRowIdle onClick={this.toggleNewRowActive} />
        )}
        {students.map(student => (
          <StudentItem
            key={student.netID}
            name={student.name}
            netID={student.netID}
            removeStudent={this.removeStudent}
          />
        ))}
      </div>
    );
  }
}

export default withAlert(UploadList);
