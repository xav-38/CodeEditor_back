const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // On spécifie l'entête pour le CORS
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

    // Traitement lorsqu'on reçoit un POST
    if (req.method === 'POST' && req.url === '/') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const editors = data.editors;

                // Générer un nom de répertoire unique
                var basePath = path.join(__dirname, Math.floor(Math.random() * 1000).toString());
                while (fs.existsSync(basePath)) {
                    basePath = path.join(__dirname, Math.floor(Math.random() * 1000).toString());
                }
                //Création du répertoire 
                fs.mkdirSync(basePath);

                // Pour chaque éditeur
                editors.forEach(editor => {
                    let filePath;

                    if (editor.language === 'html') {
                        filePath = path.join(basePath, `editor_${editor.id}.html`);
                    } else if (editor.language === 'css') {
                        filePath = path.join(basePath, `editor_${editor.id}.css`);
                    } else if (editor.language === 'javascript') {
                        filePath = path.join(basePath, `editor_${editor.id}.js`);
                    } else {
                        filePath = path.join(basePath, `editor_${editor.id}.txt`);
                    }

                    // Écrire le contenu dans le fichier et gestion des cas d'erreur
                    fs.writeFile(filePath, editor.value, err => {
                        if (err) {
                            console.error(`Erreur lors de la création du fichier ${filePath}:`, err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: `Erreur pour le fichier ${filePath}` }));
                            return;
                        }
                    });
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Fichiers créés avec succès' }));
            } catch (err) {
                console.error('Erreur parsing JSON:', err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Erreur parsing JSON' }));
            }
        });
    } else if (req.method === 'GET') { // GET 
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(`
            <html><head>
            <style></style>
            </head>
            <body>pas bon
        </body></html>`);
        res.end();
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Route non trouvée' }));
    }
});

server.listen(8000);
