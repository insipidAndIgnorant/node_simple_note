import fs from 'fs';


const stream = fs.createReadStream('./files/crypto/data.txt');
stream.on('open', (...args) => {
    console.log('open', args);
});
stream.on('ready', (...args) => {
    console.log('ready',args);
});
stream.on('close', (...args) => {
    console.log('close',args);
});
stream.on('data', (...args) => {
    console.log('data',args);
    console.log('read num',stream.bytesRead);
});