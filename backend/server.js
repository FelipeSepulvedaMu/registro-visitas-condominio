// backend/server.js (VERSIÓN PARA DESPLIEGUE EN RENDER)

require('dotenv').config(); 
const express = require('express');
const { Pool } = require('pg'); 
const cors = require('cors'); 

const app = express();
// 🔑 CAMBIO 1: Usar la variable de entorno PORT (proporcionada por Render)
const PORT = process.env.PORT || 3001; 

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false }
});

const initializeDatabase = async () => {
    try {
        const client = await pool.connect();

        // 1. Crear tabla de Visitas (Añadido: rut_visitante)
        await client.query(`
            CREATE TABLE IF NOT EXISTS visitas (
                id SERIAL PRIMARY KEY,
                casa VARCHAR(10) NOT NULL,
                visitante VARCHAR(255) NOT NULL,
                rut_visitante VARCHAR(15), 
                patente VARCHAR(10),
                conserje VARCHAR(50) NOT NULL, 
                fecha_hora TIMESTAMP WITH TIME ZONE
            )
        `);

        // 2. Crear tabla de Casas (Añadido: nombre_residente)
        await client.query(`
            CREATE TABLE IF NOT EXISTS casas (
                id_casa SERIAL PRIMARY KEY,
                casa_num VARCHAR(20) UNIQUE NOT NULL,
                telefono VARCHAR(20) NOT NULL,
                nombre_residente VARCHAR(255) 
            )
        `);

        // 3. Crear tabla Conserjes
        await client.query(`
            CREATE TABLE IF NOT EXISTS conserjes (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL
            )
        `);

        client.release();
        console.log('✅ Base de datos PostgreSQL conectada e inicializada correctamente.');
    } catch (err) {
        console.error('❌ Error al inicializar la base de datos:', err);
        process.exit(1); 
    }
};

app.use(express.json());

// 🔑 CAMBIO 2: Configuración de CORS para aceptar Vercel y Localhost
const whitelist = [
    'http://localhost:5173', 
    'https://registro-visitas-condominio-wuim.vercel.app' // URL de tu Frontend
];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir si el origen está en la lista blanca O si no hay origen (ej. peticiones locales/cURL)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

// --- RUTAS API ---

// 🏘️ Ruta GET Casas (Modificada: Ahora trae nombre_residente)
app.get('/api/casas', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                casa_num AS casa, 
                telefono, 
                nombre_residente 
            FROM casas 
            ORDER BY id_casa ASC
        `);
        res.json(result.rows); 
    } catch (err) {
        console.error('Error al obtener casas:', err.message);
        res.status(500).json({ error: "Error interno al listar casas" });
    }
});

// Ruta GET Conserjes
app.get('/api/conserjes', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nombre FROM conserjes ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener conserjes:', err.message);
        res.status(500).json({ error: "Error al listar conserjes" });
    }
});

// ✍️ POST registrar visita (Modificada: Ahora recibe y guarda rut_visitante)
app.post('/api/visitas', async (req, res) => {
    // ⚠️ Ahora esperamos 'rut_visitante' en el cuerpo de la petición
    const { casa, visitante, rut_visitante, patente, conserje } = req.body; 
    
    // Asumimos que rut_visitante es obligatorio
    if (!casa || !visitante || !conserje || !rut_visitante) { 
        return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    const now = new Date().toISOString(); 

    try {
        const result = await pool.query(
            // ⚠️ Añadimos $3 para el RUT y movemos el índice de los siguientes
            "INSERT INTO visitas (casa, visitante, rut_visitante, patente, conserje, fecha_hora) VALUES ($1, $2, $3, $4, $5, $6) RETURNING fecha_hora",
            [casa, visitante, rut_visitante, patente || null, conserje, now] // ⚠️ Pasamos el nuevo parámetro
        );

        const fechaFormateada = new Date(result.rows[0].fecha_hora).toLocaleString('es-CL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        });

        res.json({
            message: "Visita registrada",
            fechaHora: fechaFormateada
        });
    } catch (err) {
        console.error("Error al insertar:", err.message);
        res.status(500).json({ error: "Error al registrar visita." });
    }
});


// GET historial (SOLUCIÓN DE FECHA FINAL: JavaScript Formatea)
app.get('/api/visitas', async (req, res) => {
    // Nota: El código actual trae todos los datos, incluyendo el RUT
    try {
        // SQL: Leemos todas las columnas, incluyendo el rut_visitante
        const result = await pool.query(`
            SELECT id, casa, visitante, rut_visitante, patente, conserje, fecha_hora
            FROM visitas
            ORDER BY fecha_hora DESC
        `);

        // JAVASCRIPT: Transformamos y aplicamos el formato Chileno.
        const visitas = result.rows.map(v => {
            let fechaHoraString = '';

            if (v.fecha_hora) {
                const fecha = new Date(v.fecha_hora); 
                
                fechaHoraString = fecha.toLocaleString('es-CL', {
                    day: '2-digit', month: '2-digit', year: 'numeric', 
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                });
            }

            // Retornamos el objeto con el nombre de propiedad que el Frontend espera.
            return {
                id: v.id,
                casa: v.casa,
                visitante: v.visitante,
                rutVisitante: v.rut_visitante, // 🔑 Nuevo campo para el historial
                patente: v.patente,
                conserje: v.conserje,
                fechaHora: fechaHoraString 
            };
        });

        res.json(visitas);

    } catch (err) {
        console.error('Error historial:', err.message);
        res.status(500).json({ error: "Error al listar historial" });
    }
});


initializeDatabase().then(() => {
    app.listen(PORT, () => console.log(`📡 Backend en puerto ${PORT}`));
});