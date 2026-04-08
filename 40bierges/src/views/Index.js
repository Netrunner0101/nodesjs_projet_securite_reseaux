import React from "react";
import { Redirect } from 'react-router-dom'

import '../assets/css/main.css'
import axios from "axios";
import tools from "../toolBox"
import Navbar from "../components/Navbar";

class Index extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showSecret: false,
      redirected: false,
      token: "",
      mail: "",
      secret: "",
      isAdmin: false,
      isLoading: true,
      url: process.env.REACT_APP_API_URL || "http://localhost:3001"
    };
    this.toggleSecret = this.toggleSecret.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
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

  toggleSecret() {
    this.setState({ showSecret: !this.state.showSecret })
  }

  handleLogout() {
    tools.deleteCookie("Token");
    this.setState({ redirected: true });
  }

  fetchData() {
    axios.get(this.state.url + '/user', {
      headers: {
        'token': this.state.token
      }
    }).then(response => {
      this.setState({
        mail: response.data.mail,
        secret: response.data.secret,
        isLoading: false
      })
    }).catch(error => {
      console.log(error)
    });
  }

  promisedSetState = (newState) => new Promise(resolve => this.setState(newState, resolve));

  render() {
    if (this.state.redirected) return (<Redirect to="/login" />)
    if (this.state.isAdmin) return (<Redirect to="/admin" />)
    if (this.state.isLoading) return (<div className="loading">Chargement</div>);
    return (
      <>
        <Navbar currentPage="index" isLoggedIn={true} onLogout={this.handleLogout} />

        <div className="container">
          <div className="dashboard-header">
            <h1>Bienvenue, <span className="text-teal">{this.state.mail}</span></h1>
            <p>Votre espace personnel sur la plateforme CTF IFOSUP</p>
          </div>

          <div className="card">
            <h2>Votre secret</h2>
            <p>
              Chaque participant possede un secret unique. Si un attaquant parvient a lire
              votre secret, cela signifie que votre compte a ete compromis. Gardez-le precieusement.
            </p>
            <div className="secret-box">
              {this.state.showSecret
                ? <span className="secret-value">{this.state.secret}</span>
                : <span className="secret-hidden">********************</span>
              }
              <button
                className={this.state.showSecret ? "btn btn-sm btn-outline-navy" : "btn btn-sm btn-outline"}
                onClick={this.toggleSecret}
              >
                {this.state.showSecret ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-card">
              <div className="icon"><span role="img" aria-label="discussion">&#128172;</span></div>
              <h3>Blog communautaire</h3>
              <p>
                Echangez avec les autres participants via le blog interne.
                Partagez vos decouvertes (sans spoilers !).
              </p>
              <a href="/blog" className="btn btn-sm btn-outline mt-2">Acceder au blog</a>
            </div>
            <div className="info-card">
              <div className="icon"><span role="img" aria-label="idee">&#128161;</span></div>
              <h3>Rappel du challenge</h3>
              <p>
                Une backdoor se cache dans cette application. Explorez les routes
                de l'API, inspectez le code source, et tentez d'obtenir un acces admin.
              </p>
            </div>
            <div className="info-card">
              <div className="icon"><span role="img" aria-label="trophee">&#127942;</span></div>
              <h3>Page d'Or</h3>
              <p>
                Vous avez reussi le challenge ? Inscrivez votre equipe sur le
                tableau d'honneur et laissez un message pour la posterite.
              </p>
              <a href="/golden" className="btn btn-sm btn-outline mt-2">Acceder a la Page d'Or</a>
            </div>
          </div>
        </div>

        <footer className="footer">
          <p>IFOSUP Wavre &mdash; Projet Securite Reseaux &mdash; {new Date().getFullYear()}</p>
        </footer>
      </>
    )
  }
}

export default Index;
