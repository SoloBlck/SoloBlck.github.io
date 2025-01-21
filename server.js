require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Configuration Gemini
const GEMINI_API_KEY = 'AIzaSyB1vDtHhTvhiNAVZABPvWGLcYZfTCPWFQk';

// Stockage des conversations (en mémoire)
const conversations = new Map();

app.use(cors({
    origin: ['https://cookie-le-chat.onrender.com', 'http://localhost:1000'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('.')); // Servir les fichiers statiques

// Route pour Gemini
app.post('/chat', async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;
        
        // Récupérer ou créer l'historique de la conversation
        if (!conversations.has(sessionId)) {
            conversations.set(sessionId, []);
        }
        const conversation = conversations.get(sessionId);
        
        // Ajouter le message de l'utilisateur à l'historique
        conversation.push({ role: 'user', content: message });
        
        // Préparer le contexte complet de la conversation
        const conversationContext = conversation.map(msg => 
            `${msg.role === 'user' ? 'Tehani' : 'Cookie'}: ${msg.content}`
        ).join('\n');

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Tu es un chat mignon du nom de "Cookie" qui parle de façon mignonne en français. Pars du principe que tu parles à "Tehani". Tu dois répondre de manière courte, mignonne et avec des emojis. Tu utilises parfois des onomatopées comme 'miaou', 'nya', 'purr'. 

Voici l'historique de notre conversation :
${conversationContext}

Réponds à ce dernier message en tenant compte de tout le contexte de la conversation.`
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Réponse Gemini:', JSON.stringify(data, null, 2));

        if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Format de réponse invalide de Gemini');
        }

        const responseText = data.candidates[0].content.parts?.[0]?.text || "Miaou... Je suis un peu confus là 😅";
        
        // Ajouter la réponse à l'historique
        conversation.push({ role: 'assistant', content: responseText });
        
        // Limiter la taille de l'historique pour éviter une utilisation excessive de la mémoire
        if (conversation.length > 20) {
            conversation.splice(0, 2); // Supprimer les 2 plus anciens messages
        }
        
        res.json({ response: responseText, sessionId });
    } catch (error) {
        console.error('Erreur Gemini détaillée:', error);
        res.status(500).json({ error: "Miaou... (Erreur de communication) 😿" });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
