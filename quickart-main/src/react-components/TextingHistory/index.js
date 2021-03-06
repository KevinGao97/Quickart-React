import React from "react"
import "./styles.css"

import vanishModeImage from "./../../images/vanish-mode-image.png"

import Message from "./../Message"
import VanishMode from "./../VanishMode"


var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

class TextingHistory extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			history: [
				["hey", today, false], // first element is message sent, second is the date/time it was sent, third is whether this is a message recieved or sent (false if recieved, true if sent), fourth indicated whether message is an attahced image (if it is an attached iamge, true, false if text message)
				["why aren't you responding?", today, false],
				["how busy are you? I was wondering if we could meet up for the carrots.", today, false],
				["are you there?", today, false],
				["I'm sorry did I make you anxious?", today, false],
				["Can I have the carrots for $5 instead of $9? I'm broke.", today, false],
				["Hi sorry I was really busy but yes, I am available to meet next Tuesday at 4 pm if that works for you? :)", today, true],
			],
			sentMessage: null,
			vanishMode: false,
			vanishModeHistory: []
		}
	}

	handleVanishMode() {
		if (this.state.vanishMode) {
			this.setState({
				vanishMode: false,
				vanishModeHistory: [] // erase history because it's vanish mode
			})
		}
		else {
   			this.setState({
   				vanishMode: true
   			})
   		}

	}

	handleChange(event) {
		if(event.key === 'Enter') {
			//if (event.target.value.replace(/\s/g, '').length)
			//if (event.target.value || event.target.value.length > 0)
			console.log("mesage: ", event.target.value)
			if (!(event.target.value.trim() === "")) { // catches strings that are just whitespace or empty, we don't want to render these messages.
				if (this.state.vanishMode) {
					this.setState({
						message: true,
						vanishModeHistory: this.state.vanishModeHistory.concat([[event.target.value, today, true, false]]),
						sentMessage: ""
					})	
				}
				else {
					this.setState({
						message: true,
						history: this.state.history.concat([[event.target.value, today, true, false]]),
						sentMessage: ""
					})
				}
			}
			this.mainInput.value = ""
    	}
	}

	scrollToBottom = () => {
	  this.messagesEnd.scrollIntoView({ behavior: "smooth" });
	}

	componentDidMount() {
	  this.scrollToBottom();
	}

	componentDidUpdate() {
	  this.scrollToBottom();
	}



	render() {
		const messageHistory = this.state.history.map((item,index) =>  <Message key={index} messageText={item[0]} date={item[1]} location={item[2]} isImage={item[3]}/>)
		const vanishModeHistory = this.state.vanishModeHistory.map((item,index) =>  <Message key={index} messageText={item[0]} date={item[1]} location={item[2]} isImage={item[3]}/>)
		return (
			<div className="messageBox">
				<div className="messageHeader">
					<div className="textHistoryIconContainer">
						<img alt="profile pic" className="textHistoryProfileIcon" src={this.props.profilePic} />
					</div>
					<div className="textHistoryUsernameContainer">
						<h1>{this.props.userName}</h1>
					</div>
				</div>
				<div className="chatHistoryContainer">
					<div className="chatHistoryBox">
						<div>
							{this.state.vanishMode ? <VanishMode vanishModeHistory={vanishModeHistory}/> : messageHistory}
						</div>
						<div style={{ float:"left", clear: "both" }}
             				ref={(el) => { this.messagesEnd = el; }}>
        				</div>
					</div>
				</div>
				<div className="textInputContainer">
					<input ref={(ref) => this.mainInput= ref} placeholder="Message..." type="text" className="textInputArea" onKeyDown={this.handleChange.bind(this)}/>
					<div className="buttonArea">
						<div className="vanishButton"> <img alt="profile pic" src={vanishModeImage} className="sendMessageImage" onClick={this.handleVanishMode.bind(this)}/> </div>	
					</div>
				</div>
			</div>
		)
	}




}

export default TextingHistory