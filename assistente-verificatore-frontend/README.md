# Assistente Verificatore - Frontend

## Test locale
1. Avvia prima il backend con `npm start`.
2. Apri questa cartella con VS Code.
3. Usa Live Server per aprire `index.html`.
   In alternativa puoi aprire direttamente index.html nel browser.

Il frontend punta a:
http://localhost:3000

Quando pubblicheremo il backend su Koyeb, modifica in `app.js`:
const API_URL = "http://localhost:3000";
con l'URL HTTPS fornita da Koyeb.

Poi il frontend potrà essere pubblicato su Netlify.
