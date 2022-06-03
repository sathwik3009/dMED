import React from "react";
import { Row, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// This is a function which renders the friends in the friends list
export function ChatCard(props) {
  return (
    <Row style={{ }}>
      <Card
        border="success"
        style={{ width: "100%", alignSelf: "center", marginLeft: "", marginTop: "0px"}}
        onClick={() => {
          props.getMessages(props.publicKey);
          //alert(props.publicKey);
        }}
      >
        <Card.Body>
          <Card.Title> {props.name} </Card.Title>
          <Card.Subtitle>
            {" "}
          
          </Card.Subtitle>
        </Card.Body>
      </Card>
    </Row>
  );
}