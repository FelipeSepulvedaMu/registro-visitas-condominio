// frontend/src/components/DictadoPorVoz.jsx

import React, { useState } from 'react';

// Se crea una instancia del objeto de Reconocimiento de Voz
// Verificamos si la API está disponible en el navegador
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const DictadoPorVoz = ({ onResult, language = 'es-ES' }) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState('');

    const toggleListening = () => {
        if (!SpeechRecognition) {
            setError('Tu navegador no soporta el reconocimiento de voz. Usa Chrome o Edge.');
            return;
        }

        if (isListening) {
            // Si ya está escuchando, detenemos el reconocimiento
            window.speechRecognition.stop();
            return;
        }

        // 1. Inicializar el objeto de reconocimiento
        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.interimResults = false; // Solo queremos el resultado final
        recognition.maxAlternatives = 1;

        // Guardamos la instancia para poder detenerla después
        window.speechRecognition = recognition; 

        // 2. Manejar el inicio
        recognition.onstart = () => {
            setIsListening(true);
            setError('');
        };

        // 3. Manejar el resultado (cuando el usuario termina de hablar)
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript); // Enviamos el texto transcrito al componente padre
        };

        // 4. Manejar el fin del reconocimiento
        recognition.onend = () => {
            setIsListening(false);
        };
        
        // 5. Manejar errores (ej: si el usuario no da permiso)
        recognition.onerror = (event) => {
            setIsListening(false);
            if (event.error === 'not-allowed') {
                 setError('Permiso de micrófono denegado. Revísalo en la configuración del navegador.');
            } else {
                 setError(`Error de reconocimiento: ${event.error}`);
            }
            console.error('Error de reconocimiento de voz:', event.error);
        };

        // 6. ¡Iniciar la escucha!
        recognition.start();
    };

    return (
        <div style={{ display: 'inline-block', marginLeft: '10px' }}>
            <button 
                type="button" 
                onClick={toggleListening}
                className={isListening ? 'btn-danger' : 'btn-secondary'} 
                style={{ padding: '8px 10px', height: '100%', display: 'flex', alignItems: 'center' }}
                title={isListening ? 'Detener Dictado' : 'Iniciar Dictado por Voz'}
            >
                {/* 🎤 Icono de micrófono */}
                {isListening ? '🔴 Escuchando...' : '🎤 Dictar'}
            </button>
            {error && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '5px' }}>{error}</p>}
        </div>
    );
};

export default DictadoPorVoz;