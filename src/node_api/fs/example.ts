import fs from 'fs';
import os from 'os';

/**
 * fs.dir.read
 */
fs.opendir('./', (err, dir) => {
    const readDir = (_dir: fs.Dir) => {
        _dir.read((err, dirent) => {
            console.log(dirent)
            if (dirent) {
                readDir(_dir);
            }
        })
    }
    readDir(dir);

    // or use iterator
    const asyncDir = dir[Symbol.asyncIterator]();
    const iteratorSync = async (_iterator: AsyncIterableIterator<fs.Dirent>) => {
        const val = await _iterator.next();
        console.log('async iterator', val.value);
        if (!val.done) {
            iteratorSync(_iterator);
        }
    }
    iteratorSync(asyncDir);

    const forAwaitOf = async (_iterator: AsyncIterableIterator<fs.Dirent>) => {
        for await (const dirent of _iterator) {
            console.log('for await of', dirent);
        }
    }



})
// Dirent {name: "xxx", Symbol(type): 1}
// Dirent {name: "xxxx", Symbol(type): 2}
// ...






/**
 * fs.watch
 */
const watch = fs.watch('./dist/index.js', (eventType, filename) => {
    console.log(`事件类型是: ${eventType}`);
    if (filename) {
        console.log(`提供的文件名: ${filename}`);
    } else {
        console.log('文件名未提供');
    }
});
watch.on('change', (eType, fName) => {
    console.log(eType, fName);
})
watch.on('close', () => {
    console.log('watcher close')
})
watch.on('error', () => {
    console.log('watcher close')
})
watch.close();
// fswatchFile
fs.watchFile('./dist/index.js', (curr, prev) => {
    console.log(`当前的最近修改时间是: ${curr.mtime}`);
    console.log(`之前的最近修改时间是: ${prev.mtime}`);
});




/**
 * fs.ReadStream
 */
const stream = fs.createReadStream('./files/crypto/data.txt');
stream.on('open', (...args) => {
    console.log('open', args);
});
stream.on('ready', (...args) => {
    console.log('ready', args);
});
stream.on('close', (...args) => {
    console.log('close', args);
});
stream.on('data', (...args) => {
    console.log('data', args);
    console.log('read num', stream.bytesRead);
});






/**
 * fs.stats
 */
const stats = fs.statSync('./files/fs/test.txt');

stats.isBlockDevice();
stats.dev;
// ....




/**
 * fs.WriteStream
 */
const writeStream = fs.createWriteStream('./files/fs/test.txt');
writeStream.on('close', () => { });
writeStream.on('open', (fd) => { });





/**
 * fs.access
 */
const file = './files/fs/test.txt';
// 检查当前目录中是否存在该文件。
fs.access(file, fs.constants.F_OK, (err) => { });

// 检查文件是否可读。
fs.access(file, fs.constants.R_OK, (err) => { });

// 检查文件是否可写。
fs.access(file, fs.constants.W_OK, (err) => { });

// 检查当前目录中是否存在该文件，以及该文件是否可写。
fs.access(file, fs.constants.F_OK | fs.constants.W_OK, (err) => {
    if (err) {
        console.error(
            `${file} ${err.code === 'ENOENT' ? '不存在' : '只可读'}`);
    } else {
        console.log(`${file} 存在，且它是可写的`);
    }
});





/**
 * fs.appendFile
 */
fs.appendFile(file, '追加的数据', 'utf8', (err) => {
});
fs.appendFile(file,
    '追加的数据',
    {
        encoding: 'utf8',
        mode: fs.constants.S_IRGRP | fs.constants.S_IROTH,
        flag: 'a+'
    },
    (err) => {
    });



/**
 * fs.chmod
 * 更改文件的权限 / 所有者和群组
 */
fs.chmod(file, 0o775, (err) => {
    if (err) throw err;
    console.log('文件的权限已被更改');
})
fs.fchmod(1, 0o775, (err) => {
    console.log('文件的权限已被更改');
})



/**
 * fs.makedir
 */
// 新的临时目录的父目录。
const tmpDir = os.tmpdir();

// 此用法是错误的：
fs.mkdtemp(tmpDir, (err, folder) => {
    if (err) throw err;
    console.log(folder);
    // 输出类似 `/tmpabc123`。
    // 新的临时目录会被创建在文件系统根目录，而不是在 /tmp 目录中。
});

// 此用法是正确的：
const { sep } = require('path');
fs.mkdtemp(`${tmpDir}${sep}`, (err, folder) => {
    if (err) throw err;
    console.log(folder);
    // 输出类似 `/tmp/abc123`。
    // 新的临时目录会被创建在 /tmp 目录中。
});




/**
 * fs.unlink
 */
fs.unlink('/files/fs/文件.txt', (err) => {
    if (err) throw err;
    console.log('文件已删除');
});
fs.unlink('/files', (err) => {
    // thorw error: cant unlink dir
})




/**
 * fs.write
 */
const data = new Uint8Array(Buffer.from('Node.js中文网'));
fs.writeFile('./files/fs/文件.txt', data, (err) => {
    if (err) throw err;
    console.log('文件已被保存');
});
// or
fs.writeFile('./files/fs/文件.txt', 'Node.js中文网', 'utf8', (err) => {
    if (err) throw err;
    console.log('文件已被保存');
});