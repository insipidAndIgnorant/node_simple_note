import fs from 'fs';

/**
 * fs.dir
 */
async function print(path: string) {
    const dir = await fs.promises.opendir(path);
    for await (const dirent of dir) {
      console.log(dirent.name);
    }
}
print('./').catch(console.error);