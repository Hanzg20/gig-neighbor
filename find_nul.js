const fs = require('fs');
const path = require('path');

function walk(dir) {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        console.error('Cannot read dir:', dir, e.message);
        return;
    }

    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (file.toLowerCase() === 'nul') {
            console.log('FOUND NUL FILE:', filePath);
            // Try to delete
            try {
                // Use \\?\ prefix for Windows long path/reserved name handling
                const winPath = '\\\\?\\' + path.resolve(filePath);
                fs.unlinkSync(filePath);
                console.log('Deleted nul file (standard)');
            } catch (e) {
                console.log('Standard delete failed, trying prefix...');
                try {
                    const winPath = '\\\\?\\' + path.resolve(filePath);
                    fs.unlinkSync(winPath);
                    console.log('Deleted nul file with prefix!');
                } catch (e2) {
                    console.error('FAILED TO DELETE:', e2.message);
                }
            }
        } else {
            try {
                const stat = fs.statSync(filePath);
                if (stat.isDirectory() && file !== '.git' && file !== 'node_modules') {
                    walk(filePath);
                }
            } catch (e) {
                // ignore
            }
        }
    });
}

walk('.');
