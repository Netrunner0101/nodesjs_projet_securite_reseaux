import React from "react";
import { Redirect } from 'react-router-dom'

import '../../assets/css/main.css'
import tools from "../../toolBox"
import axios from "axios";
import Navbar from "../../components/Navbar";

class Blog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      redirected: false,
      newMessage: "",
      messages: [],
      token: "",
      isLoading: true,
      url: process.env.REACT_APP_API_URL || "http://localhost:3001"
    };
    this.handleChange = this.handleChange.bind(this)
    this.handleSend = this.handleSend.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  };

  componentDidMount() {
    if (tools.checkIfConnected()) {
      this.promisedSetState({ token: tools.readCookie("Token") }).then(result => {
        this.fetchData()
      })
    } else {
      this.setState({ redirected: true })
    }
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleLogout() {
    tools.deleteCookie("Token");
    this.setState({ redirected: true });
  }

  handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSend();
    }
  }

  handleSend() {
    if (!this.state.newMessage.trim()) return;
    axios.post(this.state.url + '/blog', {
      message: this.state.newMessage
    }, {
      headers: {
        'token': this.state.token
      }
    }).then(response => {
      if (response.status === 200) {
        let tmp = this.state.messages
        tmp.push(this.state.newMessage)
        this.setState({ messages: tmp, newMessage: "" })
      } else {
        alert("Erreur " + response.status)
      }
    }).catch(error => {
      console.log(error)
    });
  }

  promisedSetState = (newState) => new Promise(resolve => this.setState(newState, resolve));

  fetchData() {
    axios.get(this.state.url + '/blog', {
      headers: {
        'token': this.state.token
      }
    }).then(response => {
      this.setState({
        messages: response.data,
        isLoading: false
      })
    }).catch(error => {
      console.log(error)
    });
  }

  render() {
    if (this.state.redirected) return (<Redirect to="/login" />)
    if (this.state.isLoading) return (<div className="loading">Chargement</div>);
    return (
      <>
        <Navbar currentPage="blog" isLoggedIn={true} onLogout={this.handleLogout} />

        <div className="container">
          <div className="dashboard-header">
            <h1><span role="img" aria-label="discussion">&#128172;</span> Blog <span className="text-teal">communautaire</span></h1>
            <p>Echangez avec les autres participants du challenge CTF</p>
          </div>

          <div className="card">
            <h2>Publier un message</h2>
            <p>Partagez vos idees, posez des questions, ou donnez des indices aux autres participants.</p>
            <div className="form-group mt-2">
              <textarea
                name="newMessage"
                placeholder="Ecrivez votre message ici... (Entree pour envoyer, Shift+Entree pour un saut de ligne)"
                value={this.state.newMessage}
                onChange={this.handleChange}
                onKeyPress={this.handleKeyPress}
              ></textarea>
            </div>
            <button className="btn btn-primary" onClick={this.handleSend}>
              Publier
            </button>
          </div>

          <div className="card">
            <div className="flex-between mb-2">
              <h2>Messages</h2>
              <span className="role-badge admin">{this.state.messages.length} message{this.state.messages.length !== 1 ? 's' : ''}</span>
            </div>
            {this.state.messages.length === 0 ? (
              <p>Aucun message pour l'instant. Soyez le premier a publier !</p>
            ) : (
              <div className="blog-messages">
                {this.state.messages.map((message, index) => (
                  <div className="blog-message" key={index}>
                    <div className="message-number">Message #{index + 1}</div>
                    <div className="message-text">{message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className="footer">
          <p>IFOSUP Wavre &mdash; Projet Securite Reseaux &mdash; {new Date().getFullYear()}</p>
        </footer>
      </>
    )
  }
}

export default Blog;
