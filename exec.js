const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Fonction pour exécuter le code et tester
function execCode(directory, callback) {
    const basePath = path.join(__dirname, 'code', directory);
    let cssContent = '';
    let htmlContent = '';
    let jsContent = '';

    // Lire tous les fichiers dans le répertoire
    const files = fs.readdirSync(basePath);

    // Regrouper les codes par langage
    files.forEach(file => {
        const filePath = path.join(basePath, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');

        if (file.endsWith('.css')) {
            cssContent += `<style>${fileContent}</style>\n`;
        } else if (file.endsWith('.html')) {
            htmlContent += `${fileContent}\n`;
        } else if (file.endsWith('.js')) {
            jsContent += `<script>${fileContent}</script>\n`;
        }
    });

    // Générer le code HTML complet
    const completeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        ${cssContent}
    </head>
    <body>
        ${htmlContent}
        ${jsContent}
    </body>
    </html>`;

    // Écrire le fichier HTML complet dans le répertoire pour que Cypress puisse le tester
    const completeHtmlPath = path.join(basePath, 'index.html');
    fs.writeFileSync(completeHtmlPath, completeHtml);

    // Exécuter les tests Cypress
    exec(`npx cypress run --env directoryId=${basePath}`, (err, stdout, stderr) => {
        if (err) {
            console.error('Erreur lors de l\'exécution de Cypress:', err);
            // Supprimer le répertoire même en cas d'erreur
            fs.rmSync(basePath, { recursive: true, force: true });
            return callback({ success: false, message: 'Erreur lors de l\'exécution des tests Cypress' });
        }

        console.log(`Résultats des tests Cypress:\n${stdout}`);

        // Supprimer le répertoire après l'exécution des tests
        fs.rmSync(basePath, { recursive: true, force: true });

        if (stdout.includes('All specs passed!')) {
            return callback({ success: true, message: 'test réussi' });
        } else {
            return callback({ success: false, message: 'tests échoué' });
        }
    });
}

module.exports = execCode;
