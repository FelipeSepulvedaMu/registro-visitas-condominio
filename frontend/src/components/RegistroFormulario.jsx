// frontend/src/components/RegistroFormulario.jsx

import React, { useState, useEffect } from 'react';
import Select from 'react-select'; 

const RegistroFormulario = ({ onRegistroExitoso }) => {
    
    // Estados para las opciones traídas del Backend
    const [casasOptions, setCasasOptions] = useState([]);
    const [conserjesOptions, setConserjesOptions] = useState([]); 

    const [formData, setFormData] = useState({
        casa: null, 
        visitante: '',
        rutVisitante: '', // 🆕 Nuevo: RUT del Visitante
        patente: '',
        conserje: null, 
        telefonoCasa: '',
        nombreResidente: '', // 🆕 Nuevo: Nombre del Residente Autorizado
    });

    const [errorMessage, setErrorMessage] = useState(''); 

    // EFECTO ÚNICO: Cargar Casas y Conserjes al iniciar
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // 1. Cargar Casas
                const resCasas = await fetch('http://localhost:3001/api/casas');
                if (resCasas.ok) {
                    const dataCasas = await resCasas.json();
                    setCasasOptions(dataCasas.map(c => ({
                        value: c.casa,
                        label: c.casa,
                        telefono: c.telefono,
                        nombre: c.nombre_residente, // 🔑 Captura del nombre del residente
                    })));
                }

                // 2. Cargar Conserjes
                const resConserjes = await fetch('http://localhost:3001/api/conserjes');
                if (resConserjes.ok) {
                    const dataConserjes = await resConserjes.json();
                    setConserjesOptions(dataConserjes.map(c => ({
                        value: c.nombre, 
                        label: c.nombre  
                    })));
                }

            } catch (error) {
                console.error("Error cargando datos:", error);
                setErrorMessage('❌ Error al conectar con el servidor.');
            }
        };

        cargarDatos();
    }, []);

    const handleCasaSelect = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            casa: selectedOption,
            telefonoCasa: selectedOption ? selectedOption.telefono : '', 
            nombreResidente: selectedOption ? selectedOption.nombre : '', // 🔑 Guarda el nombre
        }));
    };
    
    const handleConserjeSelect = (selectedOption) => {
        setFormData(prev => ({ ...prev, conserje: selectedOption }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            // Asegura que Patente y RUT se guarden en mayúsculas
            [name]: (name === 'patente' || name === 'rutVisitante') ? value.toUpperCase() : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!formData.casa) return setErrorMessage('🛑 Selecciona una **Casa**.');
        if (!formData.conserje) return setErrorMessage('🛑 Selecciona un **Conserje**.');
        if (!formData.visitante.trim()) return setErrorMessage('🛑 Ingresa el **Visitante**.');
        if (!formData.rutVisitante.trim()) return setErrorMessage('🛑 Ingresa el **RUT** del Visitante.'); // 🔑 Validación RUT

        try {
            const dataToSend = {
                casa: formData.casa.value, 
                visitante: formData.visitante.trim(),
                rut_visitante: formData.rutVisitante.trim().toUpperCase(), // 🔑 Envío del RUT
                patente: formData.patente.trim() || null,
                conserje: formData.conserje.value, 
            };
            
            const response = await fetch('http://localhost:3001/api/visitas', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                // Limpia el formulario (asegúrate de incluir los nuevos estados)
                setFormData({ 
                    casa: null, 
                    visitante: '', 
                    rutVisitante: '', 
                    patente: '', 
                    conserje: null, 
                    telefonoCasa: '',
                    nombreResidente: ''
                });
                onRegistroExitoso(); 
                alert(`Visita registrada correctamente.`);
            } else {
                const errorData = await response.json();
                setErrorMessage(`❌ Error: ${errorData.error}`);
            }
        } catch (error) {
            setErrorMessage('❌ Error de conexión al servidor.');
        }
    };

    return (
        <section className="card">
            <h2>Registro Rápido de Visita</h2>
            
            <form onSubmit={handleSubmit}>
                {/* CASA */}
                <div className="form-group">
                    <label>Número de Casa:</label>
                    <Select
                        options={casasOptions}
                        value={formData.casa} 
                        onChange={handleCasaSelect} 
                        placeholder="Buscar casa..."
                        isSearchable
                        isClearable
                    />
                </div>
                
                {/* 📞 TELÉFONO Y RESIDENTE (Distribución 50/50) */}
                <div className="form-group-duo"> 
                    {/* Columna 1: Teléfono (50%) */}
                    <div style={{ flex: 1, minWidth: '50%' }}>
                        <label>Teléfono:</label>
                        {formData.telefonoCasa ? (
                            <a href={`tel:${formData.telefonoCasa}`} className="telefono-enlace">
                                {formData.telefonoCasa}
                            </a>
                        ) : <p className="telefono-placeholder">—</p>}
                    </div>

                    {/* Columna 2: Residente (50%) */}
                    <div style={{ flex: 1, minWidth: '50%' }}>
                        <label>Residente Autorizado:</label>
                        <p className="residente-display">
                            {formData.nombreResidente || 'Selecciona una casa'}
                        </p>
                    </div>
                </div>

                {/* VISITANTE */}
                <div className="form-group">
                    <label>Visitante (Nombre Completo):</label>
                    <input type="text" name="visitante" value={formData.visitante} onChange={handleChange} required />
                </div>
                
                {/* 🔑 RUT VISITANTE (Nuevo Campo) */}
                <div className="form-group">
                    <label>RUT del Visitante:</label>
                    <input 
                        type="text" 
                        name="rutVisitante" 
                        value={formData.rutVisitante} 
                        onChange={handleChange} 
                        required 
                        maxLength="15"
                    />
                </div>

                {/* PATENTE */}
                <div className="form-group">
                    <label>Patente (Opcional):</label>
                    <input type="text" name="patente" value={formData.patente} onChange={handleChange} maxLength="10" />
                </div>

                {/* CONSERJE */}
                <div className="form-group">
                    <label>Conserje Responsable:</label>
                    <Select
                        options={conserjesOptions} 
                        value={formData.conserje} 
                        onChange={handleConserjeSelect}
                        placeholder="Selecciona un Conserje..."
                        isSearchable={false}
                    />
                </div>

                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <hr style={{ margin: '15px 0' }}/> 
                <button type="submit" className="btn-success">Registrar Visita</button>
            </form>
        </section>
    );
};

export default RegistroFormulario;