import React from "react";
import { Redirect } from 'react-router-dom'

import '../../assets/css/main.css'
import axios from "axios";
import tools from "../../toolBox"
import Navbar from "../../components/Navbar";

class Admin extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showSecret: false,
            redirected: false,
            token: "",
            userList: "",
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
        axios.get(this.state.url + '/admin', {
            headers: {
                'token': this.state.token
            }
        }).then(response => {
            if (response.status === 200) {
                this.setState({
                    userList: response.data,
                    isLoading: false
                })
            } else {
                this.setState({ redirected: true })
            }
        }).catch(error => {
            this.setState({ redirected: true })
            console.log(error)
        });
    }

    promisedSetState = (newState) => new Promise(resolve => this.setState(newState, resolve));

    render() {
        if (this.state.redirected) return (<Redirect to="/login" />)
        if (this.state.isLoading) return (<div className="loading">Chargement</div>);
        return (
            <>
                <Navbar currentPage="admin" isLoggedIn={true} onLogout={this.handleLogout} />

                <div className="container">
                    <div className="dashboard-header">
                        <h1><span role="img" aria-label="cadenas">&#128274;</span> Panneau <span className="text-teal">Administrateur</span></h1>
                        <p>Acces complet au systeme - Gestion des utilisateurs et de leurs secrets</p>
                    </div>

                    <div className="card">
                        <h2>Votre secret administrateur</h2>
                        <p>
                            En tant qu'administrateur, vous avez acces a l'ensemble des donnees
                            de la plateforme, y compris les secrets de tous les participants.
                        </p>
                        <div className="secret-box">
                            {this.state.showSecret
                                ? <span className="secret-value">{this.state.userList[0].secret}</span>
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

                    <div className="card">
                        <div className="flex-between mb-2">
                            <h2>Tous les utilisateurs inscrits</h2>
                            <span className="role-badge admin">{this.state.userList.length} comptes</span>
                        </div>
                        <p>
                            Si un attaquant parvient a acceder a cette page, il pourra lire
                            les secrets de chaque utilisateur. C'est l'objectif du challenge CTF.
                        </p>
                        <table className="users-table mt-2">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Secret</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.userList.map((user, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{user.mail}</td>
                                        <td>
                                            <span className={"role-badge " + user.role}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="text-mono">{user.secret}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <footer className="footer">
                    <p>IFOSUP Wavre &mdash; Projet Securite Reseaux &mdash; {new Date().getFullYear()}</p>
                </footer>
            </>
        );
    }
}

export default Admin;
