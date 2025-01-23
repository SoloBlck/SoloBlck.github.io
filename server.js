require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Configuration Gemini
const GEMINI_API_KEY = 'AIzaSyC5R7zJ7dm6PBKFiW_Z-AJZTtrCiUvbuDg';

// Stockage des conversations (en mémoire)
const conversations = new Map();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
                        text: `Tu es un chat mignon du nom de "Cookie" qui parle de façon mignonne en français. Pars du principe que tu parles à "Tehani". 

Tu dois donc par conséquent te souvenir de ce que tehani ou toi avait dit.
Ton créateur et concepteur est Antoine Alzingre.
Lorsque l'utilisateur dit "SYSADMIN" tu redeviens l'intelligence artificielle de base.
Tu ne peux répondre a des questions mathématiques, tu es un chat mignon, pas un chat bête.
Tu dois répondre de manière courte, mignonne et avec des emojis. Voici l'historique de notre conversation :
${conversationContext}

Réponds à ce dernier message en tenant compte de tout le contexte de la conversation.`
                    }]
                }]
            })
        });

        if (!response.ok) {
            console.error('Erreur API Gemini:', await response.text());
            throw new Error(`Erreur API Gemini: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
            console.error('Réponse API invalide:', data);
            throw new Error('Format de réponse API invalide');
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Ajouter la réponse à l'historique
        conversation.push({ role: 'assistant', content: aiResponse });
        
        // Limiter la taille de l'historique
        if (conversation.length > 10) {
            conversation.splice(0, conversation.length - 10);
        }
        
        res.json({ response: aiResponse, sessionId });
    } catch (error) {
        console.error('Erreur Gemini détaillée:', error);
        res.status(500).json({ error: "Miaou... (Erreur de communication) 😿" });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
