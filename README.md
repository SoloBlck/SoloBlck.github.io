# Chat MiawMiaw

Un chat bot mignon avec une interface pixel art qui utilise l'API Gemini pour générer des réponses kawaii en français.

## Configuration

1. Clonez ce dépôt
2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```
GEMINI_API_KEY=votre_clé_api_gemini
```

4. Pour le développement local, démarrez le serveur :
```bash
npm start
```

## Déploiement

Pour déployer l'application en production :

1. Configurez les variables d'environnement sur votre hébergeur :
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`
   - `PORT` (si nécessaire)

2. Mettez à jour l'origine CORS dans `server.js` avec votre domaine de production.

3. Assurez-vous que le fichier `.env` n'est pas inclus dans votre dépôt Git.

## Sécurité

- Ne commettez jamais le fichier `.env` dans Git
- Utilisez HTTPS en production
- Limitez les origines CORS aux domaines nécessaires
- Gardez vos dépendances à jour

## Crédits

Fait par Antoine Pour titi ❤️
