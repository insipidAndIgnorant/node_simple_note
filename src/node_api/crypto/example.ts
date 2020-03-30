import crypto from 'crypto';
import fs from 'fs';
import assert  from 'assert';



// cipher && decipher

const algorithm = 'aes-192-cbc';
const password = 'password';
const originData = 'something you don not konw';
// 密钥长度取决于算法。 
// 在此示例中，对于 aes192，它是 24 个字节（192 位）。
// 改为使用异步的 `crypto.scrypt()`。
const key = crypto.scryptSync(password, '盐值', 24);
// 使用 `crypto.randomBytes()` 生成随机的 iv 而不是此处显示的静态的 iv。
const iv = Buffer.alloc(16, 0); // 初始化向量。

const cipher = crypto.createCipheriv(algorithm, key, iv);

const cipherUse:number = 3;
if (cipherUse === 1) {
    // 使用 Cipher 对象作为流：
    let encrypted = '';
    cipher.on('readable', () => {
        let chunk;
        while (null !== (chunk = cipher.read())) {
            encrypted += chunk.toString('hex');
        }
    });
    cipher.on('end', () => {
        console.log('cipher write end =>', encrypted);
        // 打印: d58f7f1ae9bc6013a1f36145c88782f03dc7705cb506172c5dc989aea5a39549
    });

    cipher.write(originData);
    cipher.end();
} else if (cipherUse === 2) {
    // 使用 Cipher 和管道流：
    const input = fs.createReadStream('./files/crypto/data.txt');
    const output = fs.createWriteStream('./files/crypto/cipher.enc');
    input.pipe(cipher).pipe(output)
    
} else if (cipherUse === 3) {
    // 使用 cipher.update() 和 cipher.final() 方法:
    let encrypted = cipher.update(originData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    console.log('cipher update end =>', encrypted);
    // d58f7f1ae9bc6013a1f36145c88782f03dc7705cb506172c5dc989aea5a39549
}

const iv1 = Buffer.alloc(16, 0);
const decipher = crypto.createDecipheriv(algorithm, key, iv1);
const decipherData = 'd58f7f1ae9bc6013a1f36145c88782f03dc7705cb506172c5dc989aea5a39549';
if (cipherUse === 1) {
    let decrypted = '';
    decipher.on('readable', () => {
        let chunk;
        while (null !== (chunk = decipher.read())) {
            decrypted += chunk.toString('utf8');
        }
    });
    decipher.on('end', () => {
        console.log('decipher write end =>', decrypted);
        // 打印: something you don not konw
    });

    decipher.write(decipherData, 'hex');
    decipher.end();
} else if (cipherUse === 4) {
    const output = fs.createWriteStream('./files/crypto/dec_data.txt');
    const input = fs.createReadStream('./files/crypto/cipher.enc');
    input.pipe(decipher).pipe(output);
    // 输出: something you don not konw
} else if (cipherUse === 3) {
    let decrypted = decipher.update(decipherData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log('decipher update end =>', decrypted);
    // 打印: something you don not konw
}








// DiffieHellman

// 生成 Alice 的密钥。
const alice = crypto.createDiffieHellman(2048);
const aliceKey = alice.generateKeys();

// 生成 Bob 的密钥。
const bob = crypto.createDiffieHellman(alice.getPrime());
const bobKey = bob.generateKeys();

// 交换并生成密钥。
const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);
console.log('alice scecret:', aliceSecret.toString('hex'))
console.log('bob scecret:', bobSecret.toString('hex'))

assert.strictEqual(aliceSecret.toString('hex'), bobSecret.toString('hex'));





// hash
const hash = crypto.createHash('sha256');
let hashUse: number = 2;
const hashData = 'some date need create hash';
if (hashUse === 1) {
    hash.on('readable', () => {
        // 哈希流只会生成一个元素。
        const data = hash.read();
        console.log('hash write =>', data.toString('hex'))
        // 5711fc724ca0c2d1ec35efe774b16889c9a4b78f88303a3c5ecb05648db5ac73
    })
    hash.write(hashData);
    hash.end();
} else if (hashUse === 2) {
    hash.setEncoding('hex');
    const input = fs.createReadStream('./files/crypto/hash.txt');
    input.pipe(hash).pipe(process.stdout);
    // 5711fc724ca0c2d1ec35efe774b16889c9a4b78f88303a3c5ecb05648db5ac73
} else if (hashUse === 3) {
    hash.update(hashData);
    console.log('hash digest =>', hash.digest('hex'));
    // 5711fc724ca0c2d1ec35efe774b16889c9a4b78f88303a3c5ecb05648db5ac73
}





// hmac
const hmac = crypto.createHmac('sha256', 'secrate key');
let hmacUse: number = 3;
if (hmacUse === 1) {
    hmac.on('readable', () => {
        // 哈希流只会生成一个元素。
        const data = hmac.read();
        console.log('hmac read =>', data.toString('hex'))
        // 304fa09aae29005238277c0af37d67a5eba8ded192aa5ebd8e05b7d11e2a9e7f
    })
    hmac.write(hashData);
    hmac.end();
} else if (hmacUse === 2) {
    hmac.setEncoding('hex');
    const input = fs.createReadStream('./files/crypto/hash.txt');
    input.pipe(hmac).pipe(process.stdout);
    // 304fa09aae29005238277c0af37d67a5eba8ded192aa5ebd8e05b7d11e2a9e7f
} else if (hmacUse === 3) {
    hmac.update(hashData);
    console.log('hmac digest =>', hmac.digest('hex'));
    // 304fa09aae29005238277c0af37d67a5eba8ded192aa5ebd8e05b7d11e2a9e7f
}





// sign && verify

const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'sect239k1',
    publicKeyEncoding: {
        type: "spki",
        format: "pem"
    },
    privateKeyEncoding: {
        type: "sec1",
        format: "pem"
        // cipher: "aes-256-cbc",
        // passphrase: "top secret"
    }
});

const sign = crypto.createSign('SHA256');
const verify = crypto.createVerify('SHA256');

const signData = 'some date need create sign';
let signUse: number = 1;
let signature: string | Buffer;
if (signUse === 1) {
    sign.write(signData);
    sign.end();
    signature = sign.sign(privateKey, 'hex');

    verify.write(signData);
    verify.end();
    
    console.log('verify signdata:', verify.verify(publicKey, signature));
    // false // if verify with 3rd param 'hex' => true
} else if (signUse === 2) {
    sign.update(signData);
    sign.end();
    signature = sign.sign(privateKey);

    verify.update(signData);
    verify.end();

    console.log('verify signdata:', verify.verify(publicKey, signature));
    // true
    // if sign with hex => false
}


// generateKeyPair
const { generateKeyPair } = crypto;
generateKeyPair('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: 'top secret'
    }
  }, (err, publicKey, privateKey) => {
    // Handle errors and use the generated key pair.
  });





// scrypt
crypto.scrypt('密码', '盐值', 64, (err, derivedKey) => {
    if (err) throw err;
    console.log(derivedKey.toString('hex'));  // '00d9e09...8a4f15a'
});
// 使用自定义的 N 参数。必须是 2 的次方。
crypto.scrypt('密码', '盐值', 64, { N: 1024 }, (err, derivedKey) => {
    if (err) throw err;
    console.log(derivedKey.toString('hex'));  // 'f710b45...f04e377'
});