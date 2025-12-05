import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

// Importar componentes
import RegistroFormulario from './components/RegistroFormulario';
import ListadoVisitas from './components/ListadoVisitas';
import Navbar from './components/Navbar'; // Lo crearemos en el paso 3

function AppContent() {
    const [visitas, setVisitas] = useState([]);
    const navigate = useNavigate(); // Hook para navegar entre rutas

    const cargarVisitas = useCallback(async (filtros = {}) => {
        // Lógica para construir la URL de filtros (igual que antes)
        const params = new URLSearchParams();
        if (filtros.fecha) params.append('fecha', filtros.fecha);
        if (filtros.casa) params.append('casa', filtros.casa);
        
        const url = `/api/visitas?${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar las visitas');
            const data = await response.json();
            setVisitas(data);
        } catch (error) {
            console.error("Error al obtener el listado:", error);
            setVisitas([]);
        }
    }, []);

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
            
            <Navbar /> {/* Incluimos el nuevo menú */}

            <main>
                <Routes>
                    {/* Ruta principal: Muestra el Formulario de Registro */}
                    <Route path="/" element={
                        <RegistroFormulario 
                            onRegistroExitoso={handleRegistroExitoso} 
                        />
                    } />
                    
                    {/* Ruta /registro: También muestra el Formulario de Registro */}
                    <Route path="/registro" element={
                        <RegistroFormulario 
                            onRegistroExitoso={handleRegistroExitoso} 
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