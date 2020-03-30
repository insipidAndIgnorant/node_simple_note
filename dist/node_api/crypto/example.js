"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
var fs_1 = __importDefault(require("fs"));
var assert_1 = __importDefault(require("assert"));
// cipher && decipher
var algorithm = 'aes-192-cbc';
var password = 'password';
var originData = 'something you don not konw';
// 密钥长度取决于算法。 
// 在此示例中，对于 aes192，它是 24 个字节（192 位）。
// 改为使用异步的 `crypto.scrypt()`。
var key = crypto_1.default.scryptSync(password, '盐值', 24);
// 使用 `crypto.randomBytes()` 生成随机的 iv 而不是此处显示的静态的 iv。
var iv = Buffer.alloc(16, 0); // 初始化向量。
var cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
var cipherUse = 3;
if (cipherUse === 1) {
    // 使用 Cipher 对象作为流：
    var encrypted_1 = '';
    cipher.on('readable', function () {
        var chunk;
        while (null !== (chunk = cipher.read())) {
            encrypted_1 += chunk.toString('hex');
        }
    });
    cipher.on('end', function () {
        console.log('cipher write end =>', encrypted_1);
        // 打印: d58f7f1ae9bc6013a1f36145c88782f03dc7705cb506172c5dc989aea5a39549
    });
    cipher.write(originData);
    cipher.end();
}
else if (cipherUse === 2) {
    // 使用 Cipher 和管道流：
    var input = fs_1.default.createReadStream('./files/crypto/data.txt');
    var output = fs_1.default.createWriteStream('./files/crypto/cipher.enc');
    input.pipe(cipher).pipe(output);
}
else if (cipherUse === 3) {
    // 使用 cipher.update() 和 cipher.final() 方法:
    var encrypted = cipher.update(originData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    console.log('cipher update end =>', encrypted);
    // d58f7f1ae9bc6013a1f36145c88782f03dc7705cb506172c5dc989aea5a39549
}
var iv1 = Buffer.alloc(16, 0);
var decipher = crypto_1.default.createDecipheriv(algorithm, key, iv1);
var decipherData = 'd58f7f1ae9bc6013a1f36145c88782f03dc7705cb506172c5dc989aea5a39549';
if (cipherUse === 1) {
    var decrypted_1 = '';
    decipher.on('readable', function () {
        var chunk;
        while (null !== (chunk = decipher.read())) {
            decrypted_1 += chunk.toString('utf8');
        }
    });
    decipher.on('end', function () {
        console.log('decipher write end =>', decrypted_1);
        // 打印: something you don not konw
    });
    decipher.write(decipherData, 'hex');
    decipher.end();
}
else if (cipherUse === 4) {
    var output = fs_1.default.createWriteStream('./files/crypto/dec_data.txt');
    var input = fs_1.default.createReadStream('./files/crypto/cipher.enc');
    input.pipe(decipher).pipe(output);
    // 输出: something you don not konw
}
else if (cipherUse === 3) {
    var decrypted = decipher.update(decipherData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log('decipher update end =>', decrypted);
    // 打印: something you don not konw
}
// DiffieHellman
// 生成 Alice 的密钥。
var alice = crypto_1.default.createDiffieHellman(2048);
var aliceKey = alice.generateKeys();
// 生成 Bob 的密钥。
var bob = crypto_1.default.createDiffieHellman(alice.getPrime());
var bobKey = bob.generateKeys();
// 交换并生成密钥。
var aliceSecret = alice.computeSecret(bobKey);
var bobSecret = bob.computeSecret(aliceKey);
console.log('alice scecret:', aliceSecret.toString('hex'));
console.log('bob scecret:', bobSecret.toString('hex'));
assert_1.default.strictEqual(aliceSecret.toString('hex'), bobSecret.toString('hex'));
// hash
var hash = crypto_1.default.createHash('sha256');
var hashUse = 2;
var hashData = 'some date need create hash';
if (hashUse === 1) {
    hash.on('readable', function () {
        // 哈希流只会生成一个元素。
        var data = hash.read();
        console.log('hash write =>', data.toString('hex'));
        // 5711fc724ca0c2d1ec35efe774b16889c9a4b78f88303a3c5ecb05648db5ac73
    });
    hash.write(hashData);
    hash.end();
}
else if (hashUse === 2) {
    hash.setEncoding('hex');
    var input = fs_1.default.createReadStream('./files/crypto/hash.txt');
    input.pipe(hash).pipe(process.stdout);
    // 5711fc724ca0c2d1ec35efe774b16889c9a4b78f88303a3c5ecb05648db5ac73
}
else if (hashUse === 3) {
    hash.update(hashData);
    console.log('hash digest =>', hash.digest('hex'));
    // 5711fc724ca0c2d1ec35efe774b16889c9a4b78f88303a3c5ecb05648db5ac73
}
// hmac
var hmac = crypto_1.default.createHmac('sha256', 'secrate key');
var hmacUse = 3;
if (hmacUse === 1) {
    hmac.on('readable', function () {
        // 哈希流只会生成一个元素。
        var data = hmac.read();
        console.log('hmac read =>', data.toString('hex'));
        // 304fa09aae29005238277c0af37d67a5eba8ded192aa5ebd8e05b7d11e2a9e7f
    });
    hmac.write(hashData);
    hmac.end();
}
else if (hmacUse === 2) {
    hmac.setEncoding('hex');
    var input = fs_1.default.createReadStream('./files/crypto/hash.txt');
    input.pipe(hmac).pipe(process.stdout);
    // 304fa09aae29005238277c0af37d67a5eba8ded192aa5ebd8e05b7d11e2a9e7f
}
else if (hmacUse === 3) {
    hmac.update(hashData);
    console.log('hmac digest =>', hmac.digest('hex'));
    // 304fa09aae29005238277c0af37d67a5eba8ded192aa5ebd8e05b7d11e2a9e7f
}
// sign && verify
var _a = crypto_1.default.generateKeyPairSync('ec', {
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
}), privateKey = _a.privateKey, publicKey = _a.publicKey;
var sign = crypto_1.default.createSign('SHA256');
var verify = crypto_1.default.createVerify('SHA256');
var signData = 'some date need create sign';
var signUse = 1;
var signature;
if (signUse === 1) {
    sign.write(signData);
    sign.end();
    signature = sign.sign(privateKey, 'hex');
    verify.write(signData);
    verify.end();
    console.log('verify signdata:', verify.verify(publicKey, signature));
    // false // if verify with 3rd param 'hex' => true
}
else if (signUse === 2) {
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
var generateKeyPair = crypto_1.default.generateKeyPair;
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
}, function (err, publicKey, privateKey) {
    // Handle errors and use the generated key pair.
});
// scrypt
crypto_1.default.scrypt('密码', '盐值', 64, function (err, derivedKey) {
    if (err)
        throw err;
    console.log(derivedKey.toString('hex')); // '00d9e09...8a4f15a'
});
// 使用自定义的 N 参数。必须是 2 的次方。
crypto_1.default.scrypt('密码', '盐值', 64, { N: 1024 }, function (err, derivedKey) {
    if (err)
        throw err;
    console.log(derivedKey.toString('hex')); // 'f710b45...f04e377'
});
//# sourceMappingURL=example.js.map