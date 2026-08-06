const fs = require('fs');
const content = fs.readFileSync('src/styles.scss', 'utf16le'); // Try utf16le just in case, but actually I will just read file normally and replace everything after '}\r\n\0' or similar.
