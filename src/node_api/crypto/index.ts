import { Certificate } from "crypto";
type BinaryLike = string | Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array | DataView;

/**
 * @namespace Certificate  证书类
 */
// 【 Certificate  证书类 】
// certificate.exportChallenge(spkac):Buffer
// spkac: BinaryLike
// 返回spkac数据结构的challenge部分， spkac 包含一个公钥和一个 challenge

// certificate.exportPublicKey(spkac):Buffer
// 返回spkac数据结构的公钥组件，包括公钥和challenge。

// certificate.verifySpkac(spkac):Buffer
// spkac: Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array | DataView
// 如果 pkac数据结构是有效的返回 true，否则返回 false



/**
 * @namespace  Cipher密码类 && Decipher  解码类
 */
// 【 Cipher  密码类 】
// cipher.final(outputEncoding?)
// 返回任何剩余的加密内容。如果指定了 outputEncoding，则返回一个字符串。如果未提供 outputEncoding，则返回 Buffer。
// 一旦调用了 cipher.final() 方法，则 Cipher 对象就不能再用于加密数据。 如果试图多次调用 cipher.final()，则将会导致抛出错误。

// cipher.setAutoPadding(autoPadding = true)
// 当使用块加密算法时， Cipher 类会自动添加填充到输入数据中，来适配相应块大小，当 autoPadding 是 false 时，整个输入数据的长度必须是 cipher 块大小的倍数

// cipher.update(data: string, input_encoding, output_encoding): string;
// ⚪ data
// ⚪ input_encoding 数据的字符编码。 "utf8" | "ascii" | "binary"
// ⚪ output_encoding 返回值的字符编码。 "binary" | "base64" | "hex"
// 使用 data 更新加密。 如果指定了 inputEncoding 参数，则 data 参数是使用了指定的字符编码的字符串。
// 如果未指定 inputEncoding 参数，则 data 必须是一个 Buffer、 TypedArray 或 DataView。 如果 data 是一个 Buffer、 TypedArray 或 DataView，
// 则 inputEncoding 会被忽略。
// outputEncoding 指定了加密的数据的输出格式。 如果指定了 outputEncoding，则返回使用了指定的字符编码的字符串。 如果未提供 outputEncoding，则返回 Buffer。
// 可以使用新数据多次调用 cipher.update() 方法，直到 cipher.final() 被调用。 在 cipher.final() 之后调用 cipher.update() 将会导致抛出错误
// 【 Decipher  解码类 】
// 与cipher类 类似 各方法对应



/**
 * @namespace  DiffieHellman ECDH
 */
// 【 DiffieHellman类 】
// 拓展： Diffie-Hellman:一种确保共享KEY安全穿越不安全网络的方法；是一种建立密钥的方法，而不是加密方法。可以用这个方法确定对称密钥

// 【 ECDH类 】
// ECDH 类是创建椭圆曲线 Elliptic Curve Diffie-Hellman（ECDH）键交换的实用工具。



/**
 * @namespace  Hash Hmac
 */
// 【 Hash 类 】 
// 哈希流只会生成一个元素。
// 使用 hash.update() 和 hash.digest() 方法生成计算后的哈希。是一种双工流


//  【 Hmac 类 】
// Hmac 类是一个实用工具，用于创建加密的 HMAC 摘要。
// 作为可读写的流，其中写入数据以在可读侧生成计算后的 HMAC 摘要。
// 使用 hmac.update() 和 hmac.digest() 方法生成计算后的 HMAC 摘要




/**
 * @namespace  Sign Verify
 */
// 【 Sign 类 】
//  类是一个实用工具，用于生成签名
// 作为可读写的流，其中写入数据以在可读侧生成计算后的签名
// 使用 sign.update() 和 sign.digest() 方法生成计算后的 签名

// sign.sign(privateKey, outputEncoding?) // 如果outEncodeing设值,则返回string,否则为Buffer
// verify.verify第三个参数可指定签名比较方式





/**
 * @namespace  KeyObject
 */
// 【 KeyObject 类 】
// keyObject.asymmetricKeyType
// 对于非对称密钥，此属性表示密钥的类型。支持 'rsa' 'rsa-pss''dsa''ec' 'x25519''x448' 'ed25519' 'ed448' 
// 对于无法识别的KeyObject类型和对称密钥，未定义此属性

// keyObject.export(KeyExportOptions<'pem'|'der'>)
// 对于对称密钥，此函数分配包含密钥材料的Buffer，并忽略任何选项, 对于非对称密钥，options参数用于确定导出格式
// 公钥支持编码选项： { type: 'pkcs1'(RSA only) | 'spki',  format: 'pem' | 'der' }
// 私钥支持编码选项： { 
//      type: 'pkcs1'(RSA only) | 'pkcs8' | 'sec1',  
//      format: 'pem' | 'der' ,
//      cipher: string,  // 如果指定，将使用给定的cipher和密码短语使用PKCS对私钥进行加密。
//      passphrase:  string | Buffer  用于加密的密码短语 
// }

// keyObject.symmetricKeySize
// 对于密钥，此属性表示密钥的大小（字节）。未定义非对称密钥的此属性

// keyObject.type
// 根据此KeyObject的类型，此属性可以是secret(对称加密)， 'public'(非对称公开加密)， 'private'(非对称私密加密)






/**
 * @namespace  Crypto
 */
// 【 Crypto 类 】
`cipher && decipher`;
// crypto.createCipheriv(algorithm: string, key: CipherKey, iv: BinaryLike | null, options?: stream.TransformOptions)
// ⚪ algorithm  取决于 OpenSSL; openssl list -cipher-algorithms将会显示可用的密码算法。
// ⚪ key  algorithm 使用的原始密钥, 必须是 'utf8' 编码的字符串、Buffer、 TypedArray 或 DataView 或 secret 类型的 KeyObject
// ⚪ iv   初始化向量，如果密码不需要初始化向量，则 iv 可以为 null
// ⚪ options   与stream.Transform流选项相同

// crypto.createDecipheriv(algorithm: string, key: CipherKey, iv: BinaryLike | null, options?: stream.TransformOptions)
// 创建对应解码模块

// crypto.createDiffieHellman
// 创建DiffieHellman

`hash`;
// crypto.createHash(algorithm: string, options?: HashOptions)
// ⚪ algorithm 取决于平台上的 OpenSSL 的版本所支持的可用算法
// ⚪ options
//       interface HashOptions extends stream.TransformOptions {
//          outputLength?: number;
//       }

// crypto.createHmac(algorithm: string, key: BinaryLike, options?: stream.TransformOptions)
// 生成带加密的hash

`privateKey && publicKey && secretKey`;
// crypto.createPrivateKey(key: PrivateKeyInput | string | Buffer)
// PrivateKeyInput.key: PEM或者DER格式
// PrivateKeyInput.format: pem' | 'der'， 默认 pem
// PrivateKeyInput.type: 'pkcs1' | 'pkcs8' | 'sec1'. 仅当format为der时为必选项. pem时忽略
// PrivateKeyInput.passphrase: 用于解密的密码短语
// @return  创建并返回包含私钥的新密钥对象。
// 如果key是string或Buffer，则假定格式为“pem”；否则，key必须是PrivateKeyInput
// 如果私钥已加密，则必须指定passphrase。passphrase的长度限制为1024字节

// crypto.createPublicKey(key: PublicKeyInput | string | Buffer | KeyObject)
// PublicKeyInput: 与PrivateKeyInput相似，没有passphrase， format为 'pkcs1' | 'spki'
// 创建并返回包含公钥的新密钥对象， 特殊：如果密钥是“private”类型的key object，则公钥派生自给定的私钥
// 因为公钥可以从私钥派生，所以可以传递私钥而不是公钥 在这种情况下，此函数的行为与调用crypto.createPrivateKey()类似，
// 只是返回的KeyObject的类型将为“public”，并且无法从返回的KeyObject中提取私钥。类似地，如果给定类型为“private”的key object，
// 则将返回类型为“public”的新KeyObject，并且将无法从返回的对象中提取私钥。

// crypto.createSecretKey(key: Buffer)： KeyObject
// 创建并返回一个新的密钥对象，该对象包含用于对称加密或Hmac的密钥

`crypto => sign && verify`;
// crypto.createSign(algorithm: string, options?: stream.WritableOptions)
// crypto.createVerify(algorithm: string, options?: stream.WritableOptions)

// crypto.generateKeyPair(type, options, callback)
// ⚪ type   'rsa' | 'dsa' | 'ec' | 'ed25519' | 'ed448' | 'x25519' | 'x448' 
// ⚪ options
//    options.modulusLength  密钥大小(RSA,DSA)
//    options.publicExponent  公共指数（RSA）。默认值：0x10001。
//    options.divisorLength  q大小(DSA)
//    options.namedCurve  要使用的曲线的名称（EC）。
//    options.publicKeyEncoding  同keyObject.export().
//    options.privateKeyEncoding 同keyObject.export().
// ⚪ callback: (err:Error|null, publicKey:string, privateKey:string) => void
// 生成给定类型的新非对称密钥对。
// 如果指定了publicKeyEncoding或privateKeyEncoding，则此函数的行为就好像对其结果调用了keyObject.export()。否则，key的相应部分将作为KeyObject返回
// 建议将公钥编码为“spki”，将私钥编码为“pkcs8”，并对长期存储进行加密

// crypto.generateKeyPairSync(type, options)
// generateKeyPair同步版本 返回 { publicKey, privateKey }

`cry get XXX`;
// crypto.getCiphers()
// 返回支持的密码算法名称的数组

// crypto.getCurves()
// 返回支持的椭圆曲线名称的数组

// crypto.getDiffieHellman(groupName:string)
// example
// const crypto = require('crypto');
// const alice = crypto.getDiffieHellman('modp14');
// const bob = crypto.getDiffieHellman('modp14');
// alice.generateKeys();
// bob.generateKeys();
// const aliceSecret = alice.computeSecret(bob.getPublicKey(), null, 'hex');
// const bobSecret = bob.computeSecret(alice.getPublicKey(), null, 'hex');
// /* aliceSecret and bobSecret should be the same */
// console.log(aliceSecret === bobSecret);

// crypto.getFips()
// 当且仅当当前正在使用符合FIPS的加密提供程序时为true

// crypto.getHashes()
// 返回支持的hash算法的数组

`pbkdf2`;
// crypto.pbkdf2(password: BinaryLike,salt: BinaryLike,iterations: number,keylen: number,digest: string, callback: (err: Error | null, derivedKey: Buffer) => any):Buffer
// 提供PBKDF2实现。由digest指定的选定HMAC摘要算法从密码、salt和iterations中派生keylen长度的密钥。默认digest:'sha1'
// 默认digest:'sha1';  迭代次数越多，派生密钥就越安全，但完成所需的时间就越长。  
// crypto.pbkdf2Sync
// crypto.pbkdf2同步版本

`encrypt && decrypt`;
// crypto.privateDecrypt(privateKey, buffer)
// ⚪ privateKey: string | Buffer | KeyObject | RsaPrivateKey

// crypto.privateEncrypt(privateKey, buffer)
// ⚪ privateKey: string | Buffer | KeyObject | RsaPrivateKey

// crypto.publicDecrypt(key, buffer)
// ⚪ key: RsaPublicKey | RsaPrivateKey | KeyLike | string | Buffer | KeyObject

// crypto.publicEncrypt(key, buffer)
// ⚪ key: RsaPublicKey | RsaPrivateKey | KeyLike | string | Buffer | KeyObject

`random`; `作用未明...`;
// crypto.randomBytes(size: number, callback?: (err: Error | null, buf: Buffer)
// 生成加密强伪随机数据。 size 参数是指示要生成的字节数的数值。如果提供 callback 函数，则这些字节是异步生成的

// crypto.randomFillSync(buffer: NodeJS.ArrayBufferView, offset?: number, size?: number)
// crypto.randomFill(buffer: NodeJS.ArrayBufferView, offset?: number, size?: number, callback:(err, buff) => void)

`other`;
// crypto.scrypt(password: BinaryLike,salt: BinaryLike,keylen: number,options: ScryptOptions,callback: (err:, derivedKey: Buffer) => void)
// ⚪ options
//    options.cost CPU 或内存的成本参数。必须是 2 的次方且大于1。默认值: 16384。
//    options.blockSize  块大小参数。默认值: 8
//    options.parallelization  并行化参数。默认值: 1
//    options.N  cost 的别名。只能指定两者之一。
//    options.r  blockSize 的别名。只能指定两者之一
//    options.p  parallelization 的别名。只能指定两者之一。
//    options.maxmem  内存的上限。当（大约）128 * N * r > maxmem 时是错误的。默认值: 32 * 1024 * 1024
// 提供异步的 scrypt 实现。 Scrypt 是一个基于密码的密钥派生函数，被设计为在计算和内存方面都非常高成本，目的是使暴力破解无法成功。

// crypto.scryptSync
// crypto.scrypt同步版本

// crypto.sign(algorithm: string | null | undefined, data: NodeJS.ArrayBufferView, key: KeyLike | SignPrivateKeyInput): Buffer;
// 用指定算法、key计算并返回data的签名 // 如果算法为空或未定义，则算法取决于密钥类型（尤其是Ed25519和Ed448）。

// crypto.verify(algorithm: string, data: NodeJS.ArrayBufferView, key: KeyLike | VerifyKeyWithOptions, signature: NodeJS.ArrayBufferView): boolean;
// 使用给定的密钥和算法验证数据的给定签名。如果算法为空或未定义，则算法取决于密钥类型（尤其是Ed25519和Ed448）。
