import React from "react";
import { Redirect } from 'react-router-dom'

import '../../assets/css/main.css'
import tools from "../../toolBox"
import axios from "axios";
import Navbar from "../../components/Navbar";

class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      redirected: false,
      redirectedAdmin: false,
      mail: "",
      password: "",
      url: process.env.REACT_APP_API_URL || "http://localhost:3001"
    };
    this.handleConnect = this.handleConnect.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  };

  componentDidMount() {
    if (tools.checkIfConnected()) {
      this.setState({ redirected: true })
    }
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.handleConnect();
    }
  }

  handleConnect() {
    if (this.state.mail === '' || this.state.password === '') {
      alert('Veuillez remplir tous les champs du formulaire.')
      return;
    }
    if (!/\S+@\S+\.\S+/.test(this.state.mail)) {
      alert('Le format de l\'adresse email est invalide.')
      return;
    }
    axios.post(this.state.url + '/connection', {
      mail: this.state.mail,
      password: this.state.password
    }).then(response => {
      if (response.status === 200) {
        let d = new Date();
        d.setTime(d.getTime() + (3 * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = "Token=" + response.data.token + ";" + expires + ";path=/"
        if (response.data.role === "user") {
          this.setState({ redirected: true })
        } else if (response.data.role === "admin") {
          this.setState({ redirectedAdmin: true })
        }
      } else {
        alert("Erreur " + response.status)
      }
    }).catch(error => {
      alert("Identifiants incorrects ou erreur serveur.")
      console.log(error)
    });
  }

  render() {
    if (this.state.redirected) return (<Redirect to="/index" />)
    if (this.state.redirectedAdmin) return (<Redirect to="/admin" />)
    return (
      <>
        <Navbar currentPage="login" isLoggedIn={false} />

        {/* Hero Section */}
        <div className="hero">
          <div className="badge">IFOSUP Wavre - Securite Reseaux 2025-2026</div>
          <h1>Capture The <span className="teal">Flag</span></h1>
          <p className="subtitle">
            Une application web en apparence normale... mais truffee de vulnerabilites.
            A vous de les trouver avant qu'un attaquant ne le fasse.
          </p>
        </div>

        {/* Info Cards */}
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="icon"><span role="img" aria-label="recherche">&#128269;</span></div>
              <h3>Objectif</h3>
              <p>
                Cette application simule un site web en production. Votre mission : identifier
                et exploiter les failles de securite presentes dans le code. Inspectez chaque
                recoin, du frontend au backend.
              </p>
            </div>
            <div className="info-card">
              <div className="icon"><span role="img" aria-label="attention">&#9888;&#65039;</span></div>
              <h3>Regles du jeu</h3>
              <p>
                Vous devez trouver la backdoor laissee par un developpeur negligent avant la mise
                en production. Utilisez tous les outils a votre disposition : inspecteur du
                navigateur, curl, analyse du code source...
              </p>
            </div>
            <div className="info-card">
              <div className="icon"><span role="img" aria-label="victoire">&#127942;</span></div>
              <h3>Victoire</h3>
              <p>
                Le challenge est reussi lorsque vous parvenez a obtenir un acces administrateur
                <strong> sans connaitre le mot de passe</strong>. Chaque utilisateur possede un
                secret : recuperez-les tous pour prouver votre acces.
              </p>
            </div>
          </div>

          {/* Challenge Hint Banner */}
          <div className="challenge-banner">
            <h2><span role="img" aria-label="eclair">&#9889;</span> Indice</h2>
            <p>
              Les developpeurs laissent parfois des endpoints de debug accessibles en production.
              Avez-vous pense a regarder le <strong>code source</strong> de cette page, ou a explorer
              les <span className="code-hint">routes de l'API</span> au-dela de celles documentees ?
            </p>
          </div>

          {/* CTA Page d'Or */}
          <div className="golden-cta">
            <a href="/golden" className="btn btn-outline btn-lg">
              <span role="img" aria-label="trophee">&#127942;</span> Voir la Page d'Or — Hall of Fame
            </a>
          </div>

          {/* Login Form */}
          <div className="login-section">
            <div className="login-card">
              <h2>Connexion</h2>
              <p className="login-subtitle">Connectez-vous pour acceder a votre espace</p>

              <div className="form-group">
                <label htmlFor="mail">Adresse email</label>
                <input
                  type="text"
                  id="mail"
                  name="mail"
                  placeholder="votre@email.com"
                  value={this.state.mail}
                  onChange={this.handleChange}
                  onKeyPress={this.handleKeyPress}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Votre mot de passe"
                  value={this.state.password}
                  onChange={this.handleChange}
                  onKeyPress={this.handleKeyPress}
                />
              </div>

              <button className="btn btn-primary btn-full" onClick={this.handleConnect}>
                Se connecter
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>IFOSUP Wavre &mdash; Projet Securite Reseaux &mdash; {new Date().getFullYear()}</p>
          <div className="footer-links">
            <span>Institut de Formation Superieure - Ville de Wavre</span>
          </div>
        </footer>
      </>
    )
  }
}

export default Login;
