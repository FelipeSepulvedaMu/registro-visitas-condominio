// frontend/src/components/ListadoVisitas.jsx (VERSIÓN FINAL Y ESTABLE)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ListadoVisitas = ({ visitas = [], cargarVisitas }) => {
    
    const [filtroFecha, setFiltroFecha] = useState('');
    const [visitasMostradas, setVisitasMostradas] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // cada vez que cambian las visitas (prop), las mostramos todas por defecto
        setVisitasMostradas(visitas);
    }, [visitas]);

    // ❌ ELIMINAMOS TODAS LAS FUNCIONES COMPLEJAS DE FECHA Y HORA
    // Ya que el backend (server.js) envía el campo 'fechaHora' PRE-FORMATEADO
    
    // Función para obtener YYYY-MM-DD para el input type="date" y el filtrado
    const getLocalYMD = (fechaHoraString) => {
        if (!fechaHoraString) return null;
        
        // El string viene como "DD/MM/YYYY, HH:mm:ss"
        // Extraemos solo DD/MM/YYYY
        const [fecha] = fechaHoraString.split(', '); 
        const [day, month, year] = fecha.split('/');

        // Creamos un formato YYYY-MM-DD para la comparación (en-CA)
        return `${year}-${month}-${day}`; 
    };

    // Aplica el filtro localmente usando la fecha seleccionada (YYYY-MM-DD)
    const handleFiltrar = () => {
        if (!filtroFecha) return;
        
        // filtroFecha tiene el formato YYYY-MM-DD del input
        const filtradas = visitas.filter((v) => {
            // Comparamos el formato YYYY-MM-DD de la visita con el filtro
            const ymd = getLocalYMD(v.fechaHora);
            return ymd === filtroFecha;
        });

        setVisitasMostradas(filtradas);
    };

    const handleMostrarTodo = () => {
        setFiltroFecha('');
        setVisitasMostradas(visitas);
    };

    return (
        <section className="card">
            <h2>📋 Historial de Visitas</h2>

            <hr style={{ borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />

            <div className="filtro-row">
                <div className="filtro-col">
                    <label>Filtrar por Fecha:</label>
                    <input
                        type="date"
                        value={filtroFecha}
                        onChange={(e) => setFiltroFecha(e.target.value)}
                    />
                </div>

                <div className="filtro-buttons">
                    <button onClick={handleFiltrar} className="btn-primary" disabled={!filtroFecha}>Aplicar Filtro</button>
                    <button onClick={handleMostrarTodo} className="btn-secondary">Mostrar Todo</button>
                </div>
            </div>

            <div className="table-container">
                <table className="visitas-table">
                    <thead>
                        <tr>
                            <th>Visita casa</th>
                            <th>Nombre visitante</th>
                            <th>RUT visitante</th> 
                            <th>Patente</th>
                            <th>Conserje</th>
                            <th>Fecha y Hora visita </th>
                        </tr>
                    </thead>
                    <tbody>
                        {(!visitasMostradas || visitasMostradas.length === 0) ? (
                            <tr>
                                <td colSpan="6">No hay visitas registradas para mostrar.</td>
                            </tr>
                        ) : (
                            visitasMostradas.map((visita) => (
                                <tr key={visita.id}>
                                    <td>{visita.casa}</td>
                                    <td>{visita.visitante}</td>
                                    <td>{visita.rutVisitante || 'N/A'}</td> {/* Dato que ya viene del Backend */}
                                    <td>{visita.patente || 'N/A'}</td>
                                    <td>{visita.conserje}</td>
                                    <td>{visita.fechaHora}</td> {/* ✅ MOSTRAMOS EL DATO SIN PROCESAR */}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default ListadoVisitas;