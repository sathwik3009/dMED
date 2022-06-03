import React from "react";
import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import {
  NavBar,
  ChatCard,
  Message,
  AddNewChat,
} from "./components/Components.js";
import { ethers } from "ethers";
import { abi } from "./abi";



// Add the contract address inside the quotes
const CONTRACT_ADDRESS = "0xee1741E6c559CFA0876fD539CbCb33874EBBB158";

export function App(props) {
  const [friends, setFriends] = useState(null);
  const [myName, setMyName] = useState(null);
  const [myPublicKey, setMyPublicKey] = useState(null);
  const [contractListened, setContractListened] = useState([]);
  const [activeChat, setActiveChat] = useState({
    friendname: null,
    publicKey: null,
  });
  const [activeChatMessages, setActiveChatMessages] = useState(null);
  const [showConnectButton, setShowConnectButton] = useState("block");
  const [myContract, setMyContract] = useState({
    address: "-",
    tokenName: "-",
    tokenSymbol: "-",
    totalSupply: "-"
  });

  let sending = "none";

  // Save the contents of abi in a variable
  const contractABI = abi;
  let provider;
  let signer;

  useEffect(() => {

    if(myContract.address != "-") {
      myContract.on("sendMessageEvent", (from, msg, event) => {
        //alert(activeChat.publicKey);
        getMessage(activeChat.publicKey);
      });
    }

    scrollToBottom("msg");
  }, [activeChatMessages]);



  
  const scrollToBottom = (id) => {
    const element = document.getElementById(id);
    element.scroll({ top: element.scrollHeight});
}


  // Login to Metamask and check the if the user exists else creates one
  async function login() {
    let res = await connectToMetamask();
    if (res === true) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      try {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI,
          signer
        );
        setMyContract(contract);
        const address = await signer.getAddress();
        let present = await contract.checkUserExists(address);
        let username;
        if (present) username = await contract.getUsername(address);
        else {
          username = prompt("Enter a username", "Guest");
          if (username === "") username = "Guest";
          await contract.createAccount(username);
        }
        setMyName(username);
        setMyPublicKey(address);
        setShowConnectButton("none");
      } catch (err) {
        alert("CONTRACT_ADDRESS not set properly!");
      }
    } else {
      alert("Couldn't connect to Metamask");
    }

  }

  // Check if the Metamask connects
  async function connectToMetamask() {
    try {
      await window.ethereum.send('eth_requestAccounts');
      return true;
    } catch (err) {
      return false;
    }
  }

  // Add a friend to the users' Friends List
  async function addChat(name, publicKey) {
    try {
      let present = await myContract.checkUserExists(publicKey);
      if (!present) {
        alert("Address not found: Ask them to join the app :)");
        return;
      }
      try {
        await myContract.addFriend(publicKey, name);
        const frnd = { name: name, publicKey: publicKey };
        setFriends(friends.concat(frnd));
      } catch (err) {
        alert(
          "Friend already added! You can't be friends with the same person twice ;P"
        );
      }
    } catch (err) {
      alert("Invalid address!");
    }
  }

  // Sends messsage to an user
  async function sendMessage(data) {
    sending="block";
    getMessage(activeChat.publicKey);
    if (!(activeChat && activeChat.publicKey)) return;
    const recieverAddress = activeChat.publicKey;
    await myContract.sendMessage(recieverAddress, data);
  }

  // Fetch chat messages with a friend
  async function getMessage(friendsPublicKey) {
    let nickname;
    let messages = [];
    friends.forEach((item) => {
      if (item.publicKey === friendsPublicKey) nickname = item.name;
    });
    // Get messages
    const data = await myContract.readMessage(friendsPublicKey);
    data.forEach((item) => {
      const timestamp = new Date(1000 * item[1].toNumber()).toLocaleString(undefined, {timeZone: 'Asia/Kolkata'});
      messages.push({
        publicKey: item[0],
        timeStamp: timestamp,
        data: item[2],
      });
    });
    if(sending == "block") {
      messages.push({
        publicKey: myPublicKey,
        timeStamp: "",
        data: "..."
      });
    }
    setActiveChat({ friendname: nickname, publicKey: friendsPublicKey });
    setActiveChatMessages(messages);
  }

  // This executes every time page renders and when myPublicKey or myContract changes
  useEffect(() => {
    async function loadFriends() {
      let friendList = [];
      // Get Friends
      try {
        const data = await myContract.getMyFriendList();
        data.forEach((item) => {
          friendList.push({ publicKey: item[0], name: item[1] });
        });
      } catch (err) {
        friendList = null;
      }
      setFriends(friendList);
    }
    loadFriends();
  }, [myPublicKey, myContract]);

  // Makes Cards for each Message
  const Messages = activeChatMessages
    ? activeChatMessages.map((message) => {
        let marginR= "5%";
        let marginL= "5%";
        let sender = activeChat.friendname;
        let bg = "#7fc6f5";
        if (message.publicKey === myPublicKey) {
          marginL = "45%";
          marginR = "5%";
          sender = "You";
          bg = "#7cf784";
        }
        return (
          <Message
            marginLeft={marginL}
            marginRight={marginR}
            sender={sender}
            data={message.data}
            timeStamp={message.timeStamp}
            bg={bg}
          />
        );
      })
    : null;

  // Displays each card
  const chats = friends
    ? friends.map((friend) => {
        return (
          <ChatCard
            publicKey={friend.publicKey}
            name={friend.name}
            getMessages={(key) => getMessage(key)}
          />
        );
      })
    : null;

  return (
    <Container fluid style={{ width: "95%", padding: "2px", maxHeight:"100vh",border:"2px solid black"}}>
      {/* This shows the navbar with connect button */}
      <NavBar
        username={myName}
        login={async () => login()}
        showButton={showConnectButton}
      />
      <Row>
        {/* Here the friends list is shown */}
        <Col style={{ paddingRight: "0px", borderRight: "2px solid #000000" }}>
          <div
            style={{
              backgroundColor: "#DCDCDC",
              height: "100%",
              overflowY: "auto",
            }}
          >
            {chats}
            <AddNewChat
              myContract={myContract}
              addHandler={(name, publicKey) => addChat(name, publicKey)}
            />
          </div>
        </Col>
        <Col xs={8} style={{ paddingLeft: "0px" }}>
          <div style={{ backgroundColor: "#DCDCDC", height: "100%" }}>
            {/* Chat header with refresh button, username and public key are rendered here */}
            <Row style={{ marginRight: "0px" }}>
              <Card
                style={{
                  width: "100%",
                  alignSelf: "center",
                  margin: "0 0 5px 15px",
                  top: 0,
                  
                }}
              >
                <Card.Header>
                  {activeChat.friendname} : {activeChat.publicKey}
                  <Button
                    style={{ float: "right" }}
                    variant="primary"
                    onClick={() => {
                      if (activeChat && activeChat.publicKey)
                        scrollToBottom("msg");
                       // getMessage(activeChat.publicKey);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                  </Button>
                </Card.Header>
              </Card>
            </Row>
            {/* The messages will be shown here */}
            <Row>
            <div
              className="MessageBox"
              style={{ height: "65vh", overflow: "auto" , width:"100%"}}
              id="msg"
            >
              {Messages}

            </div>
            </Row>
            {/* The form with send button and message input fields */}
            <div
              className="SendMessage"
              style={{
               padding:"2px",
                width: "100%",
                height: "8vh"
              }}
            >
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(document.getElementById("messageData").value);
                  document.getElementById("messageData").value = "";
                }}
              >
                <Form.Row className="align-items-center">
                  <Col xs={9}>
                    <Form.Control
                      id="messageData"
                      className="mb-2"
                      placeholder="Send Message"
                    />
                  </Col>
                  <Col>
                    <Button
                      className="mb-2"
                      style={{ float: "right" }}
                      onClick={() => {
                        sendMessage(
                          document.getElementById("messageData").value
                        );
                        document.getElementById("messageData").value = "";
                        scrollToBottom("msg");
                      }}
                    >
                      Send
                    </Button>
                  </Col>
                </Form.Row>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}