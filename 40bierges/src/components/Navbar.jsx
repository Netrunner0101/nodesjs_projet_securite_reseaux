import React from "react";
import '../assets/css/main.css';

function Navbar({ currentPage, isLoggedIn, onLogout }) {
    return (
        <nav className="navbar">
            <a href="/login" className="navbar-brand">
                <span className="brand-icon">&#9763;</span>
                IFOSUP <span>CTF</span>
            </a>
            <div className="navbar-links">
                {isLoggedIn ? (
                    <>
                        <a href="/index" className={currentPage === 'index' ? 'active' : ''}>Dashboard</a>
                        <a href="/blog" className={currentPage === 'blog' ? 'active' : ''}>Blog</a>
                        <button className="btn-logout" onClick={onLogout}>Deconnexion</button>
                    </>
                ) : (
                    <>
                        <a href="/login" className={currentPage === 'login' ? 'active' : ''}>Connexion</a>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
