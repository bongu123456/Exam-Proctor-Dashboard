const fs = require('fs');
const path = require('path');

const walk = function(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
const skipFiles = ['StudentDashboard.jsx', 'Navbar.jsx'];

files.forEach(file => {
    const filename = path.basename(file);
    if (skipFiles.includes(filename)) return;

    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Revert rgba(0,0,0, X) to rgba(255,255,255, X) for dark navy mode
    content = content.replace(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,/g, "rgba(255, 255, 255,");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Reverted to light glassmorphism for dark navy mode:', file);
    }
});

console.log('Done patching.');
