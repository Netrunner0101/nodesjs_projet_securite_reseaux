import React from "react";

import '../../assets/css/main.css'
import axios from "axios";
import Navbar from "../../components/Navbar";
import tools from "../../toolBox";

class GoldenWall extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      entries: [],
      alias: "",
      message: "",
      isLoading: true,
      submitted: false,
      url: process.env.REACT_APP_API_URL || "http://localhost:3001"
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.fetchEntries();
  }

  fetchEntries() {
    axios.get(this.state.url + '/golden').then(response => {
      this.setState({ entries: response.data, isLoading: false });
    }).catch(error => {
      this.setState({ isLoading: false });
      console.log(error);
    });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit() {
    if (!this.state.message.trim()) {
      alert('Veuillez ecrire un message.');
      return;
    }
    axios.post(this.state.url + '/golden', {
      alias: this.state.alias,
      message: this.state.message
    }).then(response => {
      if (response.status === 200) {
        this.setState({ alias: "", message: "", submitted: true });
        this.fetchEntries();
        setTimeout(() => this.setState({ submitted: false }), 3000);
      }
    }).catch(error => {
      console.log(error);
    });
  }

  render() {
    const isLoggedIn = tools.checkIfConnected();
    if (this.state.isLoading) return (<div className="loading">Chargement</div>);
    return (
      <>
        <Navbar currentPage="golden" isLoggedIn={isLoggedIn} onLogout={() => {
          tools.deleteCookie("Token");
          window.location.href = "/login";
        }} />

        {/* Hero */}
        <div className="hero">
          <div className="badge">Hall of Fame</div>
          <h1><span role="img" aria-label="trophee">&#127942;</span> Page <span className="teal">d'Or</span></h1>
          <p className="subtitle">
            Vous avez trouve la faille ? Inscrivez votre equipe ici pour la posterite.
            Cette page est ouverte a tous, aucune authentification requise.
          </p>
        </div>

        <div className="container">
          {/* Form */}
          <div className="card">
            <h2>Inscrire votre equipe</h2>
            <p>
              Felicitations si vous avez reussi le challenge ! Laissez un message et signez
              avec le nom de votre equipe. L'alias est facultatif — les contributions anonymes
              sont acceptees.
            </p>

            {this.state.submitted && (
              <div className="success-banner mt-2">
                Message publie avec succes !
              </div>
            )}

            <div className="form-group mt-2">
              <label htmlFor="alias">Alias / Nom d'equipe (facultatif)</label>
              <input
                type="text"
                id="alias"
                name="alias"
                placeholder="Ex: Les Hackers du Brabant, Team Wavre..."
                value={this.state.alias}
                onChange={this.handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Votre message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Racontez comment vous avez trouve la faille, laissez un mot pour les autres equipes..."
                value={this.state.message}
                onChange={this.handleChange}
              ></textarea>
            </div>

            <button className="btn btn-primary" onClick={this.handleSubmit}>
              Publier sur la Page d'Or
            </button>
          </div>

          {/* Entries */}
          <div className="card">
            <div className="flex-between mb-2">
              <h2>Tableau d'honneur</h2>
              <span className="role-badge admin">
                {this.state.entries.length} inscription{this.state.entries.length !== 1 ? 's' : ''}
              </span>
            </div>

            {this.state.entries.length === 0 ? (
              <div className="empty-state">
                <p>Aucune equipe ne s'est encore inscrite. Soyez les premiers !</p>
              </div>
            ) : (
              <div className="golden-entries">
                {this.state.entries.map((entry, index) => (
                  <div className="golden-entry" key={entry.id}>
                    <div className="golden-entry-header">
                      <span className="golden-rank">#{index + 1}</span>
                      <span className="golden-alias">{entry.alias || 'Anonyme'}</span>
                      <span className="golden-date">
                        {new Date(entry.created_at + 'Z').toLocaleDateString('fr-BE', {
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="golden-message">{entry.message}</div>
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
    );
  }
}

export default GoldenWall;
