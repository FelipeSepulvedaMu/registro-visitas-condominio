import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

// Importar componentes
import RegistroFormulario from './components/RegistroFormulario';
import ListadoVisitas from './components/ListadoVisitas';
import Navbar from './components/Navbar'; 

function AppContent() {
    const [visitas, setVisitas] = useState([]);
    const navigate = useNavigate(); // Hook para navegar entre rutas

    // 🔑 Obtener la URL base de la API de las variables de entorno (Render URL)
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const cargarVisitas = useCallback(async (filtros = {}) => {
        // Lógica para construir la URL de filtros
        const params = new URLSearchParams();
        if (filtros.fecha) params.append('fecha', filtros.fecha);
        if (filtros.casa) params.append('casa', filtros.casa);
        
        // ✨ CAMBIO: Usar BASE_URL para construir la URL absoluta a la API
        const url = `${BASE_URL}/api/visitas?${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar las visitas');
            const data = await response.json();
            setVisitas(data);
        } catch (error) {
            console.error("Error al obtener el listado:", error);
            setVisitas([]);
        }
    }, [BASE_URL]); // <-- Dependencia BASE_URL necesaria para useCallback

    useEffect(() => {
        cargarVisitas({});
    }, [cargarVisitas]);

    const handleRegistroExitoso = () => {
        // 1. Recargar los datos para la tabla
        cargarVisitas({}); 
        // 2. Navegar a la vista de listado después de registrar
        navigate('/listado'); 
    };

    return (
        <div className="container">
            <header>
                <h1>Registro y Control de Visitas</h1>
            </header>
            
            <Navbar /> 

            <main>
                <Routes>
                    {/* Ruta principal: Muestra el Formulario de Registro */}
                    <Route path="/" element={
                        <RegistroFormulario 
                            onRegistroExitoso={handleRegistroExitoso} 
                            // 🔑 Pasar BASE_URL al formulario para las peticiones GET/POST
                            BASE_URL={BASE_URL} 
                        />
                    } />
                    
                    {/* Ruta /registro: También muestra el Formulario de Registro */}
                    <Route path="/registro" element={
                        <RegistroFormulario 
                            onRegistroExitoso={handleRegistroExitoso} 
                            // 🔑 Pasar BASE_URL al formulario para las peticiones GET/POST
                            BASE_URL={BASE_URL} 
                        />
                    } />

                    {/* Ruta /listado: Muestra el Historial de Visitas */}
                    <Route path="/listado" element={
                        <ListadoVisitas 
                            visitas={visitas} 
                            cargarVisitas={cargarVisitas} 
                        />
                    } />
                    
                </Routes>
            </main>
        </div>
    );
}

// Componente principal que usa el Router
export default function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}