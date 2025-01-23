document.addEventListener('DOMContentLoaded', () => {
    const messageArea = document.getElementById('messageArea');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const micButton = document.getElementById('micButton');
    const statusIndicator = document.getElementById('status-indicator');
    const catSpeech = document.getElementById('cat-speech');

    let recognition = null;
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'fr-FR';
    }

    // Générer un ID de session unique
    const sessionId = 'session_' + Date.now();

    // Fonction pour faire parler le chat via l'API Gemini
    async function getGeminiResponse(message) {
        try {
            const response = await fetch('https://cookie-le-chat.onrender.com/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message, sessionId })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Erreur de communication:', error);
            return "Miaou... (Erreur de communication) 😿\nEssaie de me reparler dans quelques instants !";
        }
    }

    // Fonction pour animer la bulle de dialogue
    function animateCatTalking(message, duration) {
        catSpeech.textContent = message;
        setTimeout(() => {
            if (catSpeech.textContent === message) {
                catSpeech.textContent = "Miaou !";
            }
        }, duration);
    }

    // Fonction pour ajouter un message
    function addMessage(text, type = 'sent') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        messageArea.appendChild(messageDiv);
        messageArea.scrollTop = messageArea.scrollHeight;
    }

    // Fonction pour faire parler le chat
    async function makeCatSpeak(message) {
        try {
            const response = await getGeminiResponse(message);
            catSpeech.textContent = response;
            addMessage(response, 'received');
            animateCatTalking(response, 2000);
        } catch (error) {
            console.error('Erreur de communication:', error);
            catSpeech.textContent = "Miaou... (Erreur de communication) 😿\nEssaie de me reparler dans quelques instants !";
            addMessage("Miaou... (Erreur de communication) 😿\nEssaie de me reparler dans quelques instants !", 'received');
            animateCatTalking("Miaou... (Erreur de communication) 😿\nEssaie de me reparler dans quelques instants !", 2000);
        }
    }

    // Gestion de l'envoi de message
    async function handleMessage(message) {
        if (message.trim() === '') return;
        
        addMessage(message, 'sent');
        messageInput.value = '';
        
        // Faire répondre le chat
        await makeCatSpeak(message);
    }

    // Event listeners
    sendButton.addEventListener('click', () => handleMessage(messageInput.value));

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleMessage(messageInput.value);
        }
    });

    // Gestion de la reconnaissance vocale
    if (recognition) {
        micButton.addEventListener('click', () => {
            if (micButton.classList.contains('active')) {
                recognition.stop();
                micButton.classList.remove('active');
                statusIndicator.textContent = 'Microphone inactif';
            } else {
                recognition.start();
                micButton.classList.add('active');
                statusIndicator.textContent = 'Écoute...';
            }
        });

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            messageInput.value = text;
            handleMessage(text);
        };

        recognition.onend = () => {
            micButton.classList.remove('active');
            statusIndicator.textContent = 'Microphone inactif';
        };
    } else {
        micButton.style.display = 'none';
        statusIndicator.textContent = 'Reconnaissance vocale non supportée';
    }

    // Message initial du chat
    window.addEventListener('load', () => {
        makeCatSpeak("Bonjour !");
    });
});
