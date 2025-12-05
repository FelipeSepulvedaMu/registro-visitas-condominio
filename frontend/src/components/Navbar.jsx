// frontend/src/components/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
// Línea "import './Navbar.css';" eliminada

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul className="nav-list">
                <li className="nav-item">
                    <Link to="/registro" className="nav-link btn-primary">
                        📝 Registro de Visitas
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/listado" className="nav-link btn-secondary">
                        📋 Historial de Visitas
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;