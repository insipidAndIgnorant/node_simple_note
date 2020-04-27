# http
HTTP接口旨在支持传统上难以使用的协议的许多特性。特别是大块的、可能块编码的消息。*接口永远不会缓冲整个请求或者响应*，所以用户能流式传输数据。

http的消息头可能如下：
```js
{
    'content-length': '123'
    'content-type': 'text/plain'
    'connection0': 'keep-alive'
    'host': 'xxx.com'
    'accpet': '*/*'
}
```
接收到的原始消息头保存在`rawHeaders`中,以`[key1,val1, key2, val2...]`形式保存。如
```js
[
    'ConTent-Length', '123',
    'ConTent-Type', 'text/plain',
    'CONNECTION', 'keep-alive',
    'Host', 'xxx.com',
    'accpeT', '*/*'
]
```
具体header可在[common/HTTP.md](./../common/HTTP.md)查看

## http.Agent类
`Agent`负责管理`http`客户端的连接持久性和重用。它为给定的主机和端口维护一个待处理请求队列，为每个请求重用单独的套接字，直至队列为空，此时套接字将放入连接池或者销毁，以便于再次请求到同一个主机和端口。是否销毁取决于`keepAlive`选项。

连接池中的链接以启用TCP Keep-Alive，但服务器人有可能关闭连接，这种情况下将会从连接池删除，当再次为该主机和端口请求时创建新的连接。服务器可以拒绝同一连接而允许多个连接，这时不能放入连接池中，且每个连接都需要单独创建新连接

当客户端或服务器断开连接时，它将从连接池删除。池中所有未使用的套接字都将被销毁。以便没有未完成的连接时不用保持node运行

当`agent`不在使用时最好使用`destroy()`销毁,未使用的套接字也会消耗系统资源。

当套接字触发`close`或`agentRemove`时，则套接字将从代理删除。可以主动发送事件使套接字保持连接但不使代理

也可以使用`{agent: false}`选项使用`http.get`或`htpp.requset`，创建一个一次性的具有默认`Agent`选项的代理

### new Agent(options?:Object)
* `options`
  * `keepAlive` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 即使没有未完成的连接，也保持套接字，便于在下次请求时重用。*与`connection：keep-alive`意义不同*。 `Connection:keep-alive`请求头始终在代理时发送，除非明确指定`Connection`、或`keepAlive`、`maxSockets`分别为`false`、`Infinity`时，这时将使用`Connection: Close`
  * `keepAliveMsecs` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 当使用`keep-alive`选项时，指定TCP KEEP-ALIVE数据包的初始延迟。`false`或`undefined`会使用默认值：1000
  * `maxSockets` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 每个主机最大的套接字数量，默认`Infinity`
  * `maxFreeSockets` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 每个主句空闲时最大套接字数量，只用启用`keepAlive`时起作用， 默认256
  * `timeout` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 套接字超时时间，在套接字连接后设置，单位ms  
  
支持`scoket.connect()`中的`options`选项

要配置其中任意选项都需要创建自定义代理实例

补充： http请求携带 Connection: keep-alive 时，服务器收到后如果可以保持连接，则返回一个Connection:keep-alive的消息，此后客户端将始终使用该连接直到一方关闭；如果服务器不支持，则返回Connection: Close。

### **agent.createConnection(options: Object, cb?:(err,stream) => void)**
* `options`
  * `fd?` &nbsp;&nbsp; `number`
  * `allowHalfOpen`? &nbsp;&nbsp; `boolean`
  * `readable`? &nbsp;&nbsp; `boolean`
  * `writable`? &nbsp;&nbsp; `boolean`
  * `timeout`? &nbsp;&nbsp; `number`
  * `port` &nbsp;&nbsp; `number` &nbsp;&nbsp; TcpSocketConnectOpts选项
  * `host`? &nbsp;&nbsp; `string` &nbsp;&nbsp; TcpSocketConnectOpts选项
  * `localAddress`? &nbsp;&nbsp; `string` &nbsp;&nbsp; TcpSocketConnectOpts选项
  * `localPort`? &nbsp;&nbsp; `number` &nbsp;&nbsp; TcpSocketConnectOpts选项
  * `hints`? &nbsp;&nbsp; `number` &nbsp;&nbsp; TcpSocketConnectOpts选项
  * `family`? &nbsp;&nbsp; `number` &nbsp;&nbsp; TcpSocketConnectOpts选项
  * `lookup`? &nbsp;&nbsp; `LookupFunction` &nbsp;&nbsp; `(hostname: string, { all:boolean }, (err, address:string, family:number) => void)` TcpSocketConnectOpts选项
  * `path` &nbsp;&nbsp; `string` &nbsp;&nbsp; IpcSocketConnectOpts选项

生成用于HTTP请求的套接字或流。

默认情况下于`net.createConnection()`相同。可以用函数返回值或者将流/套接字传进`cb`中来提供套接字/流

此方法保证返回`net.Socket`类实例，除非指定了`Scoket`以外的套接字类型

补充： IPC： 进程间通信，用于相同机器上不同进程通信；TPC/IP: 可以在不同/相同机器之间通信。在相同机器上比IPC慢

### **agent.keepSocketAlive(socket)**
封装了`net.socket`对象上的`setKeepAlive()`，当`scoket`与请求分离并可以由`Agent`保留时调用。默认行为是
```js
socket.setKeepAlive(true, this.keepAliveMsecs);
socket.unref();
return true;
```
此方法可以有特定`Agent`子类重写。如果返回一个假值，则销毁该套接字，不再保留。

### **agent.reuseSocket(socket, request)**
由keep-alive选项而持久化后将`scoket`附加到`request`时调用，默认行为：`socket.ref()`;
可以由特定`Agent`子类重写

### **agent.destroy()**
销毁代理当前使用的所有的套接字。  
通常不需要调用。如果使用了keep-alive,在代理不再使用时最好使用`destroy`,否则套接字在关闭前可能会挂起一段时间

### **agent.freeSockets: Object**
包含当启用keep-alive时代理正在等待使用的套接字数组。

### **agent.getName(options):string**
* `options`
  * `host` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 请求发送至的服务器域名或者ip地址
  * `port` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 远程服务器的端口
  * `localAddress` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 为网络连接绑定的本地接口
  * `family` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 如果不等于undefined, 则为4或6(IP族)

获取一组请求选项的唯一名称，以判定一个连接是否可以被重用。对于HTTP代理，返回`host、port、localAddress`及`family`(可能没有)。对于HTTPS代理，该名称包含CA、证书、密以及其他可以判定套接字可重用性的HTTPS/TLS特有的选项。

### **agent.maxFreeSockets: number**
默认设置为 256。 对于启用了 `keepAlive` 的代理，这将设置在空闲状态下保持打开的最大套接字数。

### **agent.maxSockets: number**
决定代理可以为每个来源最多打开多少并发套接字。来源是`agent.getName()`的返回值

### **agent.request**
一个对象，包含尚未分配给套接字的请求队列。**不要修改**

### **agent.sockets**
一个对象，包含代理当前正在使用的套接字数组。**不要修改**  
<br/><br/><br/>


## http.ClientRequest 类
此对象由 `http.request()` 内部创建并返回。 它代表正在进行中的请求，其请求头已进入队列。 请求头仍然可以使用 `setHeader(name, value)`、`getHeader(name)` 或 `removeHeader(name)` API 进行改变。 实际的请求头将会与第一个数据块一起发送，或者当调用 `request.end()` 时发送。

要获得响应，则为请求对象添加 `'response'` 事件监听器。 当接收到响应头时，会从请求对象中触发 `'response'` 事件。 `'response'` 事件执行时具有一个参数，该参数是 `http.IncomingMessage` 的实例。

在 `'response'` 事件期间，可以添加监听器到响应对象，比如监听 `'data'` 事件。

如果没有添加 `'response'` 事件处理函数，则响应将会被完全地丢弃。 如果添加了 `'response'` 事件处理函数，则必须消费完响应对象中的数据，每当有 `'readable'` 事件时调用 `response.read()`、或添加 `'data'` 事件处理函数、或通过调用 `.resume()` 方法。 **在消费完数据之前，不会触发 `'end'` 事件。 此外，在读取数据之前，它将会占用内存，这最终可能导致进程内存不足的错误**。

与 `request` 对象不同，如果响应过早地关闭，则 `response` 对象不会触发 `'error'` 事件而是触发 `'aborted'` 事件。

Node.js 不会检查` Content-Length` 和已传输的请求体的长度是否相等。

### **'abort' 事件**
当请求被客户端中止时触发。 此事件**仅在第一次调用 abort() 时触发**。

### **'connect' 事件 (response,socket,head)=>void**
每次服务器使用 `CONNECT` 方法响应请求时都会触发。 如果未监听此事件，则接收 `CONNECT` 方法的客户端将关闭其连接。

此事件保证传入 `<net.Socket>` 类（`<stream.Duplex>` 的子类）的实例，除非用户指定了 `<net.Socket>` 以外的套接字类型。

### **'continue' 事件**
当服务器发送 `100 Continue` HTTP 响应时触发，通常是因为请求包含 `Expect: 100-continue`。 这是客户端应发送请求主体的指令。

### **'information' 事件 (info: InformationEvent) => void**
* `info`
  * `httpVersion` &nbsp;&nbsp; `<string>`
  * `httpVersionMajor` &nbsp;&nbsp; `<integer>`
  * `httpVersionMinor` &nbsp;&nbsp; `<integer>`
  * `statusCode` &nbsp;&nbsp; `<integer>`
  * `statusMessage` &nbsp;&nbsp; `<string>`
  * `headers` &nbsp;&nbsp; `<Object>`
  * `rawHeaders` &nbsp;&nbsp; `<string[]>`

服务器发送 1xx 中间响应（**不包括 101 Upgrade**）时触发。 此事件的监听器将会接收一个对象，该对象包含 HTTP 版本，状态码，状态消息，键值对请求头对象、以及具有原始请求头名称和值的数组

`101 Upgrade` 状态不会触发此事件，因为它们与传统的 HTTP 请求/响应链断开，例如 Web 套接字、现场 TLS 升级、或 HTTP 2.0。 **要收到 101 Upgrade 的通知，请改为监听 'upgrade' 事件**。

### **'response' 事件 (response: IncomingMessage) => void**
当收到**此请求**的响应时触发。 此事件仅触发一次

### **'socket' 事件 (socket: Socket) => void**
此事件保证传入 `<net.Socket>` 类（`<stream.Duplex>` 的子类）的实例，除非用户指定了 `<net.Socket>` 以外的套接字类型。

### **'timeout' 事件 () => void**
当底层套接字因不活动而超时时触发。 这只会通知套接字已空闲。 必须手动中止请求。

### **'upgrade' (response: IncomingMessage, socket: Socket, head: Buffer)=>void事件**
每次服务器响应升级请求时发出。 如果未监听此事件且响应状态码为 `101 Switching Protocols`，则接收升级响应头的客户端将关闭其连接。


### **request.abort()**
如果请求已中止，则 `request.aborted` 属性将会为 `true`。

### **request.connection: Socket**
指向底层套接字。 通常用户无需访问此属性。 特别是，由于协议解析器附加到套接字的方式，套接字将不会触发 `'readable'` 事件。 也可以通过 `request.connection` 访问 `socket`。

### **request.end(chunk: any, encoding: string, cb?: () => void)**
1. `end(cb?: () => void): void;`
2. `end(chunk: any, cb?: () => void): void;`
3. `end(chunk: any, encoding: string, cb?: () => void): void;`

完成发送请求。 如果部分请求主体还未发送，则将它们刷新到流中。 如果请求被分块，则发送终止符 `'0\r\n\r\n'`。  
如果指定了 `chunk`，则相当于调用 `request.write(chunk, encoding)` 之后再调用 `request.end(callback)`。  
如果指定了 `callback`，则当请求流完成时将调用它。

### **request.flushHeaders(): void**
刷新请求头。  
出于效率原因，Node.js 通常会缓冲请求头，直到调用 `request.end()` 或写入第一个请求数据块。 然后，它尝试将请求头和数据打包到单个 TCP 数据包中。  
这通常是期望的（它节省了 TCP 往返），但是可能很晚才发送第一个数据。 `request.flushHeaders()` 绕过优化并启动请求。

### **request.getHeader(name: string): number | string | string[]**
读取请求中的一个请求头。 该名称不区分大小写。 返回值的类型取决于提供给 `request.setHeader()` 的参数。
```js
request.getHeader('Content-Type') // 'text/html'
```
### **request.maxHeadersCount: number**
限制最大响应头数。 如果设置为 0，则不会应用任何限制。

### **request.path: string**
请求的路径。

### **request.removeHeader(name: string):void**
移除已定义到请求头对象中的请求头。

### **request.reusedSocket: boolean**
Whether the request is send through a reused socket.  
是否通过重用的套接字发送请求

When sending request through a keep-alive enabled agent, the underlying socket might be reused. But if server closes connection at unfortunate time, client may run into a 'ECONNRESET' error.  
通过启用keep alive的代理发送请求时，可能会重用底层套接字。但如果服务器在不合适的时间关闭连接，客户端可能会遇到“ECONNRESET”错误

### **request.setHeader(name: string, value: number | string | string[]): void**
为请求头对象设置单个请求头的值。 如果此请求头已存在于待发送的请求头中，则其值将被替换。 这里可以使用字符串数组来发送具有相同名称的多个请求头。 非字符串值将被原样保存。 因此 `request.getHeader()` 可能会返回非字符串值。 但是非字符串值将转换为字符串以进行网络传输。
```js
request.setHeader('Cookie', ['type=ninja', 'language=javascript']);
```

### **request.setNoDelay(noDelay?: boolean): void**
一旦将套接字分配给此请求并且连接了套接字，就会调用 `socket.setNoDelay()`。

### **request.setSocketKeepAlive(enable?: boolean, initialDelay?: number): void**
一旦将套接字分配给此请求并连接了套接字，就会调用 `socket.setKeepAlive()`。

### **request.setTimeout(timeout: number, callback?: () => void): this**
* `timeout` &nbsp;&nbsp; 请求超时前的毫秒数。
* `callback` &nbsp;&nbsp; 发生超时时要调用的可选函数。相当于绑定到 'timeout' 事件。

一旦将套接字分配给此请求并且连接了套接字，就会调用 `socket.setTimeout()`。

### **request.socket: Socket**
指向底层套接字。 通常用户无需访问此属性。 特别是，由于协议解析器附加到套接字的方式，套接字将不会触发 `'readable'` 事件。 也可以通过 `request.connection` 访问 `socket`。

### **request.writableEnded:boolean**
在调用 `request.end()` 之后为 `true`。 此属性**不表明是否已刷新数据**，对于这种应该使用 `request.writableFinished`。

### **request.writableFinished:boolean**
如果在触发 `'finish'` 事件之前，所有数据都已刷新到底层系统，则为 `true`。

### **request.write(chunk: any, encoding?: string, cb?: (error) => void)**
发送一个请求主体的数据块。 通过多次调用此方法，可以将请求主体发送到服务器。 在这种情况下，建议在创建请求时使用 `['Transfer-Encoding', 'chunked']` 请求头行。

`encoding` 参数是可选的，仅当 `chunk` 是字符串时才适用。 默认为 `'utf8'`。

`callback` 参数是可选的，当刷新此数据块时调用，但**仅当数据块非空**时才会调用。

如果将整个数据成功刷新到内核缓冲区，则返回 `true`。 如果全部或部分数据在用户内存中排队，则返回 `false`。 当缓冲区再次空闲时，则触发 `'drain'` 事件

当使用空字符串或 `buffer` 调用 `write` 函数时，则什么也不做且等待更多输入。
<br/><br/><br/>

## http.Server 类

### **'checkContinue' 事件 (req:IncomingMessage, res: ServerResponse)=>void**
每次收到 HTTP `Expect: 100-continue` 的请求时都会触发。 如果未监听此事件，服务器将自动响应 `100 Continue`。

处理此事件时，如果客户端应继续发送请求主体，则调用 `response.writeContinue()`，如果客户端不应继续发送请求主体，则生成适当的 HTTP 响应（例如 `400 Bad Request`）。

在触发和处理此事件时，**不会触发 `'request'` 事件**。

### **'checkExpectation' 事件 (req:IncomingMessage, res: ServerResponse)=>void**
每次收到带有 HTTP `Expect` 请求头的请求时触发，其中值不是 `100-continue`。 如果未监听此事件，则服务器将根据需要自动响应 `417 Expectation Failed`。

在触发和处理此事件时，不会触发 `'request'` 事件。

### **'clientError' 事件 (exception, socket)=>void**
如果客户端连接触发 `'error'` 事件，则会在此处转发。 此事件的监听器负责关闭或销毁底层套接字。 例如，用户可能希望使用自定义 HTTP 响应更优雅地关闭套接字，而不是突然切断连接。

默认行为是尝试使用 `HTTP 400 Bad Request` 关闭套接字、或者在 HPE_HEADER_OVERFLOW 错误的情况下尝试关闭 HTTP `431 Request Header Fields Too Large`。 如果套接字不可写，则会被立即销毁。

`socket` 是发生错误的 `net.Socket` 对象。

当 `'clientError'` 事件发生时，没有 `request` 或 `response` 对象，因此必须将发送的任何 HTTP 响应（包括响应头和有效负载）直接写入 `socket` 对象。 必须注意确保响应是格式正确的 HTTP 响应消息。
```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.end();
});
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000);
```
### **'close' 事件 () => void**
当服务器关闭时触发。

### **'connect' 事件 (response: IncomingMessage, socket: Socket, head: Buffer):this**
* `request` `<http.IncomingMessage>` HTTP 请求的参数，与 `'request'` 事件中的一样。
* `socket` `<stream.Duplex>` 服务器和客户端之间的网络套接字。
* `head` `<Buffer>` 隧道流的第一个数据包（可能为空）。

每次客户端请求 HTTP `CONNECT` 方法时触发。 如果未监听此事件，则请求 `CONNECT` 方法的客户端将关闭其连接。

**触发此事件后，请求的套接字将没有 'data' 事件监听器**，这意味着它需要绑定才能处理发送到该套接字上的服务器的数据。

### **'connection' 事件 (socket: Socket) => void**
建立新的 TCP 流时会触发此事件。 `socket` 通常是 `net.Socket` 类型的对象。 通常用户无需访问此事件。 特别是，由于协议解析器附加到套接字的方式，套接字将不会触发 `'readable'` 事件。 也可以通过 `request.connection` 访问 `socket`。

用户也可以显式触发此事件，以将连接注入 HTTP 服务器。 在这种情况下，可以传入任何 `Duplex` 流。

如果在此处调用 `socket.setTimeout()`，则当套接字已提供请求时（如果 `server.keepAliveTimeout` 为非零），超时将会被 `server.keepAliveTimeout` 替换

### **'request' 事件 (response: IncomingMessage, socket: Socket, head: Buffer): this**
每次有请求时都会触发。 每个连接可能有多个请求（在 HTTP Keep-Alive 连接的情况下）。

### **'upgrade' 事件 (response: IncomingMessage, socket: Socket, head: Buffer): this**
每次客户端请求 HTTP 升级时发出。 监听此事件是可选的，客户端无法坚持更改协议。

触发此事件后，请求的套接字将没有 `'data'` 事件监听器，这意味着它需要绑定才能处理发送到该套接字上的服务器的数据。

### **server.close(callback?:() => void)**
停止服务器接受新连接。  
阻止 `server` 接受新的连接并保持现有的连接。 该函数是异步的，`server` 将在所有连接结束后关闭并触发 `'close'` 事件。 可选的 `callback` 将在 `'close'` 事件发生时被调用。 与 `'close'` 事件不同的是，如果 `server` 在关闭时未打开，回调函数被调用时会传入一个 `Error` 对象作为唯一参数。

### **server.headersTimeout:number**
限制解析器等待接收完整 HTTP 请求头的时间。默认4000   

如果不活动，则适用 `server.timeout` 中定义的规则。 但是，如果请求头发送速度非常慢（默认情况下，每 2 分钟最多一个字节），那么基于不活动的超时仍然允许连接保持打开状态。 为了防止这种情况，每当请求头数据到达时，进行额外的检查，自建立连接以来，没有超过 `server.headersTimeout` 毫秒。 如果检查失败，则在服务器对象上触发 `'timeout'` 事件，并且（默认情况下）套接字被销毁。

### **server.listen()**
启动 HTTP 服务器监听连接。 此方法与 `net.Server` 中的 `server.listen()` 相同。`http.Server`继承于`net.Server`

### **server.listening:boolean**
表明服务器是否正在监听连接。

### **server.maxHeadersCount:number**
限制最大传入请求头数。 如果设置为 0，则不会应用任何限制。默认值: 2000。

### **server.setTimeout(msecs?: number, callback?: () => void):this**
设置套接字的超时值，并在服务器对象上触发 `'timeout'` 事件，如果发生超时，则将套接字作为参数传入。

如果服务器对象上有 `'timeout'` 事件监听器，则将使用超时的套接字作为参数调用它。

默认情况下，服务器的超时值为 2 分钟，如果超时，套接字会自动销毁。 但是，如果将回调分配给服务器的 `'timeout'` 事件，则必须显式处理超时。

### **server.timeout:number**
认定套接字超时的不活动毫秒数。

值为 0 将禁用传入连接的超时行为。

套接字超时逻辑在连接时设置，因此更改此值仅影响到服务器的新连接，而不影响任何现有连接。

### **server.keepAliveTimeout:number**
服务器在完成写入最后一个响应之后，在销毁套接字之前需要等待其他传入数据的非活动毫秒数。 如果服务器在保持活动超时被触发之前接收到新数据，它将重置常规非活动超时，即 `server.timeout`。

值为 0 将禁用传入连接上的保持活动超时行为。 值为 0 使得 http 服务器的行为与 8.0.0 之前的 Node.js 版本类似，后者没有保持活动超时。

套接字超时逻辑在连接时设置，因此更改此值仅影响到服务器的新连接，而不影响任何现有连接。