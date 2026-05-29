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

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace color: '#ffffff' with color: 'var(--text-main)'
    content = content.replace(/color:\s*'(#ffffff|#fff)'/g, "color: 'var(--text-main)'");
    
    // Some exceptions where color shouldn't be var(--text-main) but let's see.
    // Replace rgba(255,255,255, X) with rgba(0,0,0, X) for borders and backgrounds
    content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,/g, "rgba(0,0,0,");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Patched:', file);
    }
});

console.log('Done patching.');
