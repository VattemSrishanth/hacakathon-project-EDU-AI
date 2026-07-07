const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      const code = fs.readFileSync(fullPath, 'utf8');
      try {
        const result = babel.transformSync(code, {
          filename: fullPath,
          plugins: [
            ['@babel/plugin-syntax-jsx'],
            ['@babel/plugin-transform-typescript', { isTSX: true, allExtensions: true }]
          ],
          retainLines: true,
        });
        // retainLines might leave some weird whitespace, but we don't care that much right now
        // we just want valid JS
        if (result.code !== code) {
          fs.writeFileSync(fullPath, result.code);
          console.log('Processed:', fullPath);
        }
      } catch (e) {
        console.error('Failed:', fullPath, e.message);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
