import React from "react";
import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

export function AddNewChat(props) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <div
      className="AddNewChat"
      style={{
        bottom: "0px",
        padding:"5px",
        
      }}
    >
      <Button variant="success" className="mb-2" onClick={handleShow}>
        + New Chat
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title> Add New Chat </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              required
              id="addPublicKey"
              size="text"
              type="text"
              placeholder="Enter Public Key"
            />
            <br />
            <Form.Control
              required
              id="addName"
              size="text"
              type="text"
              placeholder="Name"
            />
            <br />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              props.addHandler(
                document.getElementById("addName").value,
                document.getElementById("addPublicKey").value
              );
              handleClose();
            }}
          >
            Add Chat
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}