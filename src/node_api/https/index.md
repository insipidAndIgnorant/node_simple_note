# HTTPS
HTTPS 是基于 TLS/SSL 的 HTTP 协议。在 Node.js 中，其被实现为一个单独的模块。

## https.Agent 类
HTTPS 的 Agent 对象，类似于 `http.Agent`。

### **new Agent(options: AgentOptions)**
* `options`
  * `maxCachedSessions` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; TLS 缓存的会话的最大数量。使用 0 可以禁用 TLS 会话的缓存。默认值: 100。
  * `servername` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 要发送到服务器的服务器名称指示的扩展名的值。使用空字符串 `''` 可以禁用发送扩展名。默认值： 目标服务器的主机名，除非目标服务器被指定为使用 IP 地址，在这种情况下默认为 `''`（无扩展名）。
  * ... &nbsp;&nbsp; 其他`http.Agent(options)`支持的选项 

### **'keylog' 事件 (line: Buffer, tlsScoket)**
* `line` &nbsp;&nbsp; `<Buffer>` &nbsp;&nbsp; ASCII 的文本行，采用 NSS 的 SSLKEYLOGFILE 格式。
* `tlsSocket` &nbsp;&nbsp; `<tls.TLSSocket>` &nbsp;&nbsp; 生成 keylog 的 tls.TLSSocket 实例。

当此 `agent` 管理的连接生成或接收到密钥材料时（通常在握手完成之前，但不一定），则触发 `'keylog'` 事件。 此密钥材料可以保存起来用以调试，因为它可以对捕获的 TLS 通信进行解密。 每个 `socket` 可以被多次触发。

一个典型的用例是，将接收到的文本行附加到一个普通的文本文件，该文件随后可被软件（例如 Wireshark）进行解密通信
```js
https.globalAgent.on('keylog', (line, tlsSocket) => {
  fs.appendFileSync('/tmp/ssl-keys.log', line, { mode: 0o600 });
});
```

<br/><br/><br/>

## https.Server 类

### **server.close(callback?:() => void)**
与`http.Server`实例类似  

停止服务器接受新连接。  
阻止 `server` 接受新的连接并保持现有的连接。 该函数是异步的，`server` 将在所有连接结束后关闭并触发 `'close'` 事件。 可选的 `callback` 将在 `'close'` 事件发生时被调用。 与 `'close'` 事件不同的是，如果 `server` 在关闭时未打开，回调函数被调用时会传入一个 `Error` 对象作为唯一参数。

### **server.headersTimeout: number**
与` http.Server#headersTimeout`相同

限制解析器等待接收完整 HTTP 请求头的时间。

如果不活动，则适用 `server.timeout` 中定义的规则。 但是，如果请求头发送速度非常慢（默认情况下，每 2 分钟最多一个字节），那么基于不活动的超时仍然允许连接保持打开状态。 为了防止这种情况，每当请求头数据到达时，进行额外的检查，自建立连接以来，没有超过 `server.headersTimeout` 毫秒。 如果检查失败，则在服务器对象上触发 `'timeout'` 事件，并且（默认情况下）套接字被销毁。

### **server.listen()**
启动 HTTPS 服务器开始监听加密的连接。 此方法与 `net.Server` 的 `server.listen()` 相同。

### **server.maxHeadersCount: number**
限制最大传入请求头数。 如果设置为 0，则不会应用任何限制。与` http.Server#maxHeadersCount`相同

### **server.setTimeout(msec: number, callback: () => void)**
设置套接字的超时值，并在服务器对象上触发 'timeout' 事件，如果发生超时，则将套接字作为参数传入。

如果服务器对象上有 `'timeout'` 事件监听器，则将使用超时的套接字作为参数调用它。

默认情况下，服务器不会使 `socket` 超时。 但是，如果将回调分配给服务器的 `'timeout'` 事件，则必须显式处理超时。

### **server.timeout: number**
认定套接字超时的不活动毫秒数。

值为 0 将禁用传入连接的超时行为。

套接字超时逻辑在连接时设置，因此更改此值仅影响到服务器的新连接，而不影响任何现有连接。

### **server.keepAliveTimeout: boolean**
服务器在完成写入最后一个响应之后，在销毁套接字之前需要等待其他传入数据的非活动毫秒数。 如果服务器在保持活动超时被触发之前接收到新数据，它将重置常规非活动超时，即 `server.timeout`。

值为 0 将禁用传入连接上的保持活动超时行为。 值为 0 使得 http 服务器的行为与 8.0.0 之前的 Node.js 版本类似，后者没有保持活动超时。

套接字超时逻辑在连接时设置，因此更改此值仅影响到服务器的新连接，而不影响任何现有连接。

### **https.createServer(options: ServerOptions, requestListener?: http.RequestListener)**
* `options` &nbsp;&nbsp; `<Object>` &nbsp;&nbsp; 接受来自 `tls.createServer()`、`tls.createSecureContext()` 和 `http.createServer()` 的 `options`。
* `requestListener` &nbsp;&nbsp; `<Function>` &nbsp;&nbsp; 要添加到 `'request'` 事件的监听器。


### **https.get(options: RequestOptions | string | URL, callback?: (res: http.IncomingMessage) => void)**
### **https.get(url: string | URL, options: RequestOptions, callback?: (res: http.IncomingMessage) => void)**
* `url` &nbsp;&nbsp; `<string> | <URL>`
* `options` &nbsp;&nbsp; `<Object> | <string> | <URL>` &nbsp;&nbsp; 接受与 `https.request()` 相同的 `options`, `method` 始终设置为 GET。

类似 `http.get()`，但是用于 HTTPS。

`options` 可以是对象、字符串、或 URL 对象。 如果 `options` 是一个字符串, 则会被自动地使用 `new URL()` 解析。 如果是一个 URL 对象，则会被自动地转换为一个普通的 `options` 对象。

### **https.globalAgent**
全局的 `https.Agent` 实例，用于所有 HTTPS 客户端请求。

### **https.request(options: RequestOptions | string | URL, callback?: (res: http.IncomingMessage) => void)**
### **https.request(url: string | URL, options: RequestOptions, callback?: (res: http.IncomingMessage) => void)**
* `url` &nbsp;&nbsp; `<string> | <URL>`
* `options` &nbsp;&nbsp; `<Object> | <string> | <URL>` &nbsp;&nbsp; 接受来自 `http.request()` 的所有 `options`，但默认值有一些差异：
  * `protocol` 默认值: `'https:'`。
  * `port` 默认值: `443`。
  * `agent` 默认值: `https.globalAgent`。

发送一个请求到一个加密的 Web 服务器。

以下来自 `tls.connect()` 的额外的 `options` 也会被接收： `ca`、 `cert`、 `ciphers`、 `clientCertEngine`、 `crl`、 `dhparam`、 `ecdhCurve`、 `honorCipherOrder`、 `key`、 `passphrase`、 `pfx`、 `rejectUnauthorized`、 `secureOptions`、 `secureProtocol`、 `servername`、 `sessionIdContext`、 `highWaterMark`。

`options` 可以是对象、字符串、或 URL 对象。 如果 `options` 是一个字符串, 则会被自动地使用 `new URL()` 解析。 如果是一个 URL 对象，则会被自动地转换为一个普通的 `options` 对象。

