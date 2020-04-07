const fs = require('fs');

async function print(path: string) {
    const dir = await fs.promises.opendir(path);
    console.log('dir')
    for await (const dirent of dir) {
      console.log(dirent.name);
    }
}
print('./').catch(console.error);