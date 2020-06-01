# tls
tls 模块是对安全传输层（TLS）及安全套接层（SSL）协议的实现，建立在OpenSSL的基础上。

## TLS/SSL 概念
TLS/SSL 是公共/私人的密钥基础设施（PKI）。 大部分情况下，每个服务器和客户端都应该有一个私钥。

私钥能有多种生成方式，下面举一个例子。 用 OpenSSL 的命令行来生成一个 2048 位的 RSA 私钥：
```
openssl genrsa -out ryans-key.pem 2048
```
通过 TLS/SSL，所有的服务器（和一些客户端）必须要一个证书。 证书是相似于私钥的公钥,它由 CA 或者私钥拥有者数字签名，特别地，私钥拥有者所签名的被称为自签名。 获取证书的第一步是生成一个证书申请文件（CSR)。

用 OpenSSL 能生成一个私钥的 CSR 文件：
```
openssl req -new -sha256 -key ryans-key.pem -out ryans-csr.pem
```
CSR 文件被生成以后，它既能被 CA 签名也能被用户自签名。 用 OpenSSL 生成一个自签名证书的命令如下：
```
openssl x509 -req -in ryans-csr.pem -signkey ryans-key.pem -out ryans-cert.pem
```
证书被生成以后，它又能用来生成一个 .pfx 或者 .p12 文件：
```
openssl pkcs12 -export -in ryans-cert.pem -inkey ryans-key.pem \
      -certfile ca-cert.pem -out ryans.pfx
```
命令行参数:
* in: 被签名的证书。
* inkey: 有关的私钥。
* certfile: 签入文件的证书串，比如： cat ca1-cert.pem ca2-cert.pem > ca-cert.pem。

## 完全前向保密
术语“前向保密”或“完全前向保密”是一种密钥协商（或称做密钥交换）方法。 通过这种方法,客户端与服务端在当前会话中，协商一个临时生成的密钥进行对称加密的密钥交换。 这意味着即使服务器端私钥发生泄漏，窃密者与攻击者也无法解密通信内容，除非他们能得到当前会话的临时密钥。

TLS/SSL 握手时，使用完全前向即每次会话都会随机生成一个临时密钥对用于对称加密密钥协商(区别于每次会话都是用相同的密钥)。 实现这个技术的密钥交换算法称为“ephemeral”。

当前最常用的两种实现完全前向保密的算法（注意算法结尾的"E"）：
* DHE - 使用临时密钥的 Diffie Hellman 密钥交换算法。
* ECDHE - 使用临时密钥的椭圆曲线 Diffie Hellman 密钥交换算法。

使用临时密钥会带来性能损失，因为密钥生成的过程十分消耗 CPU 计算性能。

如需使用完全前向加密，例如使用 tls 模块的 DHE 算法，使用之前需要生成一个 Diffie-Hellman 参数并将其用 dhparam 声明在 `tls.createSecureContext()` 中。 如下例子展示了如何使用 OpenSSL 命令生成参数：
```
openssl dhparam -outform PEM -out dhparam.pem 2048
```
如需使用 ECDHE 算法，则不需要生成 Diffie-Hellman 参数，因为可以使用默认的 ECDHE 曲线。 在创建 `TLS Server` 时，可使用 `ecdhCurve` 属性声明服务器支持的曲线名词，详请参见 `tls.createServer()`。

完全前向保密在 TLSv1.2 之前是可选的，但它不是 TLSv1.3 的可选项，因为所有 TLSv1.3 密码套件都使用 ECDHE。

## ALPN 和 SNI
ALPN（Application-Layer Protocol Negotiation Extension，应用层协议协商扩展）和SNI（Server Name Indication，服务器名称指示）是 TLS 的握手扩展：
* ALPN：允许将一个 TLS 服务器用于多种协议（HTTP、HTTP/2）。
* SNI：允许将一个 TLS 服务器用于具有不同 SSL 证书的多个主机名。

## 客户端发起的重协商攻击缓解
TLS 协议允许客户端在 TLS 会话中进行重协商，用于安全因素的考量。 不幸的是，会话重协商需要消耗大量的服务器端资源，这将导致服务器存在潜在的被 DDoS 攻击的可能。

为了减轻这个风险，限制每十分钟只能使用三次重协商，超过这个限制将会在 `tls.TLSSocket` 实例中产生一个 error 事件。 这个限制是可配置的:
* tls.CLIENT_RENEG_LIMIT number 指定重协商请求的次数限制，默认为 3。
* tls.CLIENT_RENEG_WINDOW number 指定限制次数的生效时间段，默认为 600（10 分钟）。

TLSv1.3 不支持重协商。

## 修改默认的 TLS 加密组件
Node.js 构造时包含了默认的 TLS 开启和关闭的加密组件。 目前默认的加密组件是：
```
TLS_AES_256_GCM_SHA384:
TLS_CHACHA20_POLY1305_SHA256:
TLS_AES_128_GCM_SHA256:
ECDHE-RSA-AES128-GCM-SHA256:
ECDHE-ECDSA-AES128-GCM-SHA256:
ECDHE-RSA-AES256-GCM-SHA384:
ECDHE-ECDSA-AES256-GCM-SHA384:
DHE-RSA-AES128-GCM-SHA256:
ECDHE-RSA-AES128-SHA256:
DHE-RSA-AES128-SHA256:
ECDHE-RSA-AES256-SHA384:
DHE-RSA-AES256-SHA384:
ECDHE-RSA-AES256-SHA256:
DHE-RSA-AES256-SHA256:
HIGH:
!aNULL:
!eNULL:
!EXPORT:
!DES:
!RC4:
!MD5:
!PSK:
!SRP:
!CAMELLIA
```
默认加密组件可以使用 --tls-cipher-list 命令进行替换（直接或通过 NODE_OPTIONS 环境变量）。 比如，生成 ECDHE-RSA-AES128-GCM-SHA256:!RC4 的 TLS 加密组件：
```
node --tls-cipher-list="ECDHE-RSA-AES128-GCM-SHA256:!RC4" server.js

export NODE_OPTIONS=--tls-cipher-list="ECDHE-RSA-AES128-GCM-SHA256:!RC4"
node server.js
```
默认的加密组件也可以通过客户端或者服务器的 `tls.createSecureContext()` 方法的 `ciphers` 选项来进行替换，`tls.createServer()` 方法和 `tls.connect()` 方法也可以使用 `ciphers` 选项进行设置，当然也可以在创建一个 `tls.TLSSocket` 时设置。

密码列表可以包含 TLSv1.3 密码套件名称的混合，以 'TLS_' 开头的密码，以及 TLSv1.2 及以下密码套件的规范。 TLSv1.2 密码支持传统规范格式，有关详细信息，请参见 OpenSSL 密码列表格式文档，但这些规范不适用于 TLSv1.3 密码。 只能通过在密码列表中包含其全名来启用 TLSv1.3 套件。 例如，它们不能通过使用传统的 TLSv1.2 'EECDH'或 '!EECDH' 规范来启用或禁用。

尽管 TLSv1.3 和 TLSv1.2 密码套件的相对顺序，TLSv1.3 协议明显比 TLSv1.2 更安全，并且如果握手表明它受支持，并且如果有任何 TLSv1.3 密码套件已启用，将始终选择 TLSv1.2 以上。

Node.js 包含的默认的加密组件是经过精心挑选，能体现目前最好的安全实践和最低风险。 改变默认的加密组件可以对应用的安全性有重大的影响。 --tls-cipher-list 开关和 ciphers 选项应该只在必要的时候使用。

默认加密组件倾向使用 GCM 加密作为 Chrome 现代加密设置的选项，也倾向使用 ECDHE 和 DHE 加密算法实现完美的前向安全，同时向后兼容。

依据特殊攻击影响更大位数的 AES 密钥，128 位的 AES 密钥优先于 192 位和 256 位的 AES 密钥。

老的客户端依赖不安全的 RC4 或者基于 DES 的加密（比如 IE6）不能用默认配置完成握手的过程。 如果必须支持这些客户端，TLS 推荐规范也许可以提供兼容的加密组件。 欲知更多的格式的细节请参见 OpenSSL 加密列表格式文档。

只有 5 种 TLSv1.3 密码套件：
* 'TLS_AES_256_GCM_SHA384'
* 'TLS_CHACHA20_POLY1305_SHA256'
* 'TLS_AES_128_GCM_SHA256'
* 'TLS_AES_128_CCM_SHA256'
* 'TLS_AES_128_CCM_8_SHA256'

默认情况下启用前 3 个。 TLSv1.3 支持最后 2 个基于 CCM 的套件，因为它们在受约束的系统上可能更具性能，但默认情况下它们不会启用，因为它们提供的安全性较低。

## tls.Server 类
接受使用 TLS 或 SSL 的加密连接。

### **'keylog' 事件 (line: Buffer, tlsSocket: TLSSocket) => void**
* line ASCII 的文本行，采用NSS SSLKEYLOGFILE格式。
* tlsSocket tls.TLSSocket实例

当与此服务器的连接生成或接收到密钥材料时（通常在握手完成之前，但不一定），则触发 `'keylog'` 事件。 此密钥材料可以保存起来用以调试，因为它可以对捕获的 TLS 通信进行解密。 每个 `socket` 可以被多次触发。

### **'newSession' 事件 (sessionId: Buffer, sessionData: Buffer, callback: (err: Error, resp: Buffer) => void) => void**
* sessionId TLS 会话识别符。
* sessionData  TLS 会话数据。
* callback  在安全连接时为了发送或者接收数据，无参的回调函数必须被调用。

`'newSession'` 事件在创建一个新的 TLS 会话时触发。 这可能用于在外部存储保存会话。 数据会被提供给 `'resumeSession'` 回调。

添加监听器后，监听器只在连接建立后生效。

### **'OCSPRequest' 事件 (certificate: Buffer, issuer: Buffer, callback: (err: Error | null, resp: Buffer) => void) => void**
* certificate 服务器证书
* issuer 发行人证书
* callback CSP请求结果的回调函数

当客户端发送证书状态请求时，将发出`'OCSPRequest'`事件。

可以分析服务器的当前证书以获取OCSP URL和证书ID；获取OCSP响应后，将调用`callback（null，resp）`，其中resp是包含OCSP响应的缓冲实例。certificate和issuer都是主证书和颁发者证书的Buffer表示。这些可用于获取OCSP证书ID和OCSP端点URL。

或者，可以调用`callback（null，null）`，表示没有OCSP响应。调用`callback（err）`将导致`socket.destroy（err）`调用。

OCSP请求的典型流程如下：
1. 客户端连接到服务器并发送`“OCSPRequest”`（通过ClientHello中的status info扩展）。
2. 服务器接收请求并发出`“OCSPRequest”`事件，如果已注册，则调用侦听器
3. 服务器从证书或颁发者中提取OCSP URL，并对CA执行OCSP请求。
4. 服务器从CA接收`“OCSPResponse”`，并通过回调参数将其发送回客户端
5. 客户端验证响应并销毁套接字或执行握手。

如果证书是自签名的或颁发者不在根证书列表中，则颁发者可以为空。（建立TLS连接时，可以通过ca选项提供颁发者。）

侦听此事件将仅对添加事件侦听器后建立的连接起作用。

可以使用像asn1.js这样的npm模块来解析证书。

### **'resumeSession' 事件 (sessionId: Buffer, callback: (err: Error, sessionData: Buffer) => void) => void**
当客户端请求恢复以前的TLS会话时，将发出`“resumeSession”`事件。调用时，侦听器回调传递两个参数：
* sessionId TLS会话标识符
* callback 恢复前一个会话时要调用的回调函数

事件侦听器应在外部存储中查找`“newSession”`事件处理程序使用给定sessionId保存的`sessionData`。如果找到，请调用`callback（null，sessionData）`以继续会话。如果找不到，则无法继续会话。必须在不使用`sessionData`的情况下调用`callback（）`，以便可以继续握手并创建新会话。可以调用`callback（err）`来终止传入连接并销毁套接字。

侦听此事件将仅对添加事件侦听器后建立的连接起作用

### **'secureConnection' 事件 (tlsSocket: TLSSocket) => void**
新连接的握手过程成功完成后，将发出`“secureConnection”`事件。调用时，侦听器回调传递一个参数：
* tlsSocket 建立的tls scoket

`tlsSocket.authorized`属性是一个布尔值，指示客户端是否已由为服务器提供的证书颁发机构之一验证。如果`tlsSocket.authorized`是false，那么`socket.authorizationError`设置为描述授权失败的方式。根据TLS服务器的设置，仍然可以接受未经授权的连接。

`tlsSocket.alpnProtocol`是包含选定ALPN协议的字符串。当ALPN没有选择的协议时，`tlsSocket.alpnProtocol`等于假。

`tlsSocket.servername`属性是包含通过SNI请求的服务器名称的字符串

### **'tlsClientError' 事件 (err: Error, tlsSocket: TLSSocket) => void**
在建立安全连接之前发生错误时，将发出`“tlsClientError”`事件。调用时，侦听器回调传递两个参数：
* err
* tlsSocket

### **server.addContext(hostName: string, credentials: SecureContextOptions)**
* hostname SNI主机名或通配符(e.g. '*')
* context 包含创建安全上下文（选项参数）的选项(e.g. key, cert, ca, etc)

这个`server.addContext()`方法添加一个安全上下文，如果客户端请求的SNI名称与提供的主机名（或通配符）匹配，则将使用该上下文。

### **server.address(): AddressInfo**
返回操作系统报告的服务器的绑定地址、地址系列名称和端口。见`net.Server.address()`了解更多信息。

### **server.close(callback?: (err?: Error) => void)**
`server.close`方法停止服务器接受新连接。

此函数异步运行。当服务器没有更多打开的连接时，将发出`“close”`事件。

### **server.getTicketKeys(): Buffer**
返回包含会话票证密钥的48字节缓冲区

### **server.listen()**
启动服务器侦听加密连接。此方法与`net.Server().listen`相同

### **server.setSecureContext(details: SecureContextOptions)**
* details 包含创建安全上下文（选项参数）的对象

`server.setSecureContext()`方法替换现有服务器的安全上下文。与服务器的现有连接没有中断。

### **server.setTicketKeys(keys: Buffer)**
设置会话票证密钥。

对票证密钥的更改仅对将来的服务器连接有效。现有或当前挂起的服务器连接将使用以前的密钥。

## tls.TLSSocket 类
对写入的数据和所有必需的TLS协商执行透明加密。

tls.TLSSocket实例实现双工流接口。

返回TLS连接元数据的方法(例如。tls.TLSSocket.getPeerCertificate()只在连接打开时返回数据。)

### **new tls.TLSSocket(socket: net.Socket, options?: TLSSocketOptions)**
* socket 在服务器端，任何双工流。在客户端，任何scoket（对于客户端的通用双工流支持，tls.connect()必须使用）
* options
 * enableTrace
 * isServer SSL/TLS协议是不对称的，TLSSockets必须知道它们是作为服务器还是客户机运行。如果为true，则TLS套接字将被实例化为服务器。默认值：false。
 * server net.Server实例
 * requestCert 是否通过请求证书来验证远程对等方。客户端总是请求服务器证书。服务器（isServer为true）可以将requestCert设置为true以请求客户端证书。
 * rejectUnauthorized
 * ALPNProtocols
 * SNICallback
 * session 包含TLS会话的Buffer实例。
 * requestOCSP 如果为true，则指定将OCSP状态请求扩展添加到客户端hello，并在建立安全通信之前在套接字上发出`“OCSPResponse”`事件
 * secureContext `tls.createSecureContext()`创建TLS上下文对象，如果未提供secureContext则通过将整个options对象传递给`tls.createSecureContext()`.
 * 如果secureContext选项丢失,tls.createSecureContext() 选项将被使用，反之忽略

### **'keylog' 事件 (line: Buffer) => void**
当与此tls.TLSSocket的连接生成或接收到密钥材料时（，则触发 `'keylog'` 事件。 此密钥材料可以保存起来用以调试，因为它可以对捕获的 TLS 通信进行解密。 每个 `socket` 可以被多次触发。

一个典型的用例是将接收到的行附加到一个公共文本文件中，然后由软件（如Wireshark）使用该文件来解密

### **'OCSPResponse' 事件 (response: Buffer) => void**
如果在tls.TLSSocket已创建并收到OCSP响应。调用时，侦听器回调传递一个参数
* response 服务器的OCSP响应

通常，响应是来自服务器CA的数字签名对象，该对象包含有关服务器证书吊销状态的信息

### **'secureConnect' 事件 () => void**
新连接的握手过程成功完成后，将发出`“secureConnect”`事件。无论服务器的证书是否经过授权，都将调用侦听器回调。客户有责任检查`tlsSocket.authorized`属性确定服务器证书是否由指定的CA之一签名。如果`tlsSocket.authorized===false`，然后通过检查t`lsSocket.authorizationError`。如果使用ALPN,可以检查`tlsSocket.alpnProtocol`属性以确定协商的协议。

### **'session' 事件 (session: Buffer) => void**
tls.TLSSocket在新会话或TLS票证可用时发出`“session”`事件。这可能是握手完成之前，也可能不是，这取决于协商的TLS协议版本。该事件不会在服务器上发出，或者如果未创建新会话（例如，在连接恢复时）。对于某些TLS协议版本，事件可能会多次发出，在这种情况下，所有会话都可以用于恢复。

在客户端上，可以将会话提供给`tls.connect（）`以恢复连接。

对于TLSv1.2及以下，tls.TLSSocket.getSession一旦握手完成，就可以调用了。对于TLSv1.3，协议只允许基于票证的恢复，发送多个票证，并且直到握手完成后才发送票证。因此，有必要等待`“session”`事件获得可恢复的会话。应用程序应使用`“session”`事件，而不是`getSession（）`，以确保它们适用于所有TLS版本。只希望获取或使用一个会话的应用程序应只侦听此事件一次：
```js
tlsSocket.once('session', (session) => {
  // The session can be used immediately or later.
  tls.connect({
    session: session,
    // Other connect options...
  });
});
```

### **tlsSocket.address(): AddressInfo**
返回操作系统报告的基础套接字的绑定地址、地址系列名称和端口` { port: 12346, family: 'IPv4', address: '127.0.0.1' }.`

### **tlsSocket.authorizationError: Error**
返回未验证对等方证书的原因。仅当`tlsSocket.authorized ==false`。

### **tlsSocket.authorized: boolean**
创建实例时，如果对等证书是由CA签发则为true,否则为false。

### **tlsSocket.disableRenegotiation()**
为此TLSSocket实例禁用TLS重新协商。一旦调用，重新协商的尝试将在TLSSocket上触发`“error”`事件

### **tlsSocket.enableTrace()**
启用时，TLS数据包跟踪信息将写入stderr。这可用于调试TLS连接问题。

注意：输出的格式与openssl s_client-trace或openssl s_server-trace的输出相同。虽然它是由OpenSSL的SSL_trace（）函数生成的，但格式是未记录的，可以在不通知的情况下更改，不应依赖于它。

### **tlsSocket.encrypted: boolean**
总是返回true。这可用于区分TLSsockets和常规sockets实例。

### **tlsSocket.getCertificate(): PeerCertificate | object | null**
返回表示本地证书的对象。返回的对象具有与证书字段对应的一些属性。

如果没有本地证书，将返回一个空对象。如果套接字已被销毁，则返回null。

### **tlsSocket.getCipher(): CipherNameAndProtocol**
```ts
interface CipherNameAndProtocol {
        /**
         * The cipher name. 密码套件名称
         */
        name: string;
        /**
         * SSL/TLS protocol version. 此密码套件支持的最低TLS协议版本 
         */
        version: string;

        /**
         * IETF name for the cipher suite. 密码套件的IETF名称
         */
        standardName: string;
    }
```
返回包含协商密码套件信息的对象。

### **tlsSocket.getEphemeralKeyInfo(): EphemeralKeyInfo | object | null**
返回一个对象，该对象表示客户端连接上完全前向保密的临时密钥交换的参数的类型、名称和大小。当密钥交换不是短暂的，它返回一个空对象。因为这只在客户端套接字上受支持；如果在服务器套接字上调用，则返回null。支持的类型是'DH'和'ECDH'。只有当类型为“ECDH”时，name属性才可用。
```js
{ type: 'ECDH', name: 'prime256v1', size: 256 }.
```

### **tlsSocket.getFinished(): Buffer | undefined**
返回：作为SSL/TLS握手的一部分发送到套接字的最新完成消息，如果尚未发送完成消息，则未定义。

由于完成的消息是完整握手的消息摘要（对于TLS 1.0，总计192位，对于SSL 3.0，总计192位以上），因此当不需要SSL/TLS提供的身份验证或身份验证不够时，它们可以用于外部身份验证过程。

对应于OpenSSL中的SSL-get-finished例程，可用于实现来自RFC 5929的tls唯一通道绑定。

### **tlsSocket.getPeerCertificate(detailed?: boolean): PeerCertificate | DetailedPeerCertificate**
* detailed 如果为true，则包括完整的证书链，否则仅包括对等方的证书。

返回表示对等方证书的对象。如果对等方不提供证书，将返回一个空对象。如果套接字已被销毁，则返回null。

如果请求了完整的证书链，则每个证书都将包含一个`issuerCertificate`属性，该属性包含表示其颁发者证书的对象。

## 证书对象
证书对象具有与证书字段对应的属性。
* raw `<Buffer>` DER编码的X.509证书数据。
* subject `<Object>` 证书主题，按国家（C:）、州或省（ST）、地区（L）、组织（O）、组织单位（OU）和公用名（CN）描述。CommonName通常是具有TLS证书的DNS名称。示例：`{C:'UK'，ST:'BC'，L:'Metro'，O:'Node Fans'，OU:'Docs'，CN:'example.com网站'}`.
* issuer `<Object>` 证书颁发者，用与主题相同的术语描述。
* valid_from `<string>` 证书的有效日期.
* valid_to `<string>` 证书有效的日期时间.
* serialNumber `<string>` 证书序列号，作为十六进制字符串 Example: 'B9B0D332A1AA5635'.
* fingerprint `<string>` DER编码证书的SHA-1摘要。它以：分隔的十六进制字符串返回. Example: '2A:7A:C2:DD:...'.
* fingerprint256 `<string>` DER编码证书的SHA-256摘要。它以：分隔的十六进制字符串返回. Example: '2A:7A:C2:DD:...'.
* ext_key_usage `<Array>` (Optional) 扩展密钥用法，一组oid.
* subjectaltname `<string>` (Optional)一个字符串，包含主题的连接名称，是主题名称的替代.
* infoAccess `<Array>` (Optional) 描述AuthorityInfoAccess的数组，与OCSP一起使用.
* issuerCertificate `<Object>` (Optional) 颁发者证书对象。对于自签名证书，这可能是一个循环引用。

证书可能包含有关公钥的信息，具体取决于密钥类型。  

对于RSA密钥，可以定义以下属性：
* bits `<number>` The RSA bit size. Example: 1024.
* exponent `<string>` RSA指数，作为十六进制数表示法中的字符串。示例：“0x010001”.
* modulus `<string>` RSA modulus，作为十六进制字符串. Example: 'B56CE45CB7...'.
* pubkey `<Buffer>` 公钥.

对于EC密钥，可以定义以下属性：
* pubkey `<Buffer>` 公钥.
* bits `<number>` The key size in bits. Example: 256.
* asn1Curve `<string>` (Optional) 椭圆曲线的OID的ASN.1名称。已知曲线由OID识别。虽然这是不寻常的，但曲线有可能是由其数学性质来识别的，在这种情况下，曲线将没有OID。示例：“prime256v1”.
* nistCurve `<string>` (Optional) 椭圆曲线的NIST名称（如果它有椭圆曲线的话）（并非所有已知曲线都由NIST指定名称）。示例：“P-256”.

