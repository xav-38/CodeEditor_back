const http = require('http');
const path = require('path');
const fs = require('fs');
//Fonction permettant d'exécuter le code
const execCode = require('./exec');


const server = http.createServer((req, res) => {
const codeBasePath = path.join(__dirname, 'code');

    //entête pour le CORS
    const allowOrigins = 'http://127.0.0.1:5500';
    if (req.headers.origin && allowOrigins.includes(req.headers.origin)) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'null');
    }

    // On gère le cas où le navigateur fait un pré-contrôle avec OPTIONS
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        return res.end();
    }

    // Traitement lorsqu'on reçoit un POST (Envoie du code avec le bouton 'RUN')
    if (req.method === 'POST' && req.url === '/') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const editors = data.editors;

                // Initialisation du chemin de base du répertoire "code"
                
                if (!fs.existsSync(codeBasePath)) {
                    fs.mkdirSync(codeBasePath);
                }

                // Générer un nom de répertoire unique 
                let basePath = path.join(codeBasePath, Math.floor(Math.random() * 1000).toString());
                while (fs.existsSync(basePath)) {
                    basePath = path.join(codeBasePath, Math.floor(Math.random() * 1000).toString());
                }
                // Création du répertoire unique à l'intérieur du répertoire "code"
                fs.mkdirSync(basePath);

                // Pour chaque éditeur créer un fichier par rapport à son langage
                editors.forEach(editor => {
                    let filePath;

                    if (editor.language === 'html') {
                        filePath = path.join(basePath, `editor_${editor.id}.html`);
                        htmlFilePath = filePath;
                    } else if (editor.language === 'css') {
                        filePath = path.join(basePath, `editor_${editor.id}.css`);
                    } else if (editor.language === 'javascript') {
                        filePath = path.join(basePath, `editor_${editor.id}.js`);
                    } else {
                        filePath = path.join(basePath, `editor_${editor.id}.txt`);
                    }

                    // Écrire le contenu dans le fichier et gestion des cas d'erreurs
                    fs.writeFileSync(filePath, editor.value);
                });

                // Retourner l'id du répertoire
                const directoryId = path.basename(basePath);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Fichiers créés avec succès', id: directoryId }));
            } catch (err) {
                console.error('Erreur parsing JSON:', err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Erreur parsing JSON' }));
            }
        });
    } else if (req.method === 'GET' && req.url.startsWith('/?id=')) { // GET request to display the HTML content
        //Récupérer l'id du répertoire de la requête
        const directoryId = req.url.split('=')[1];

        try {
            const htmlContent = execCode(directoryId);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlContent);
        } catch (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Route non trouvée' }));
    }
});

server.listen(8000);
