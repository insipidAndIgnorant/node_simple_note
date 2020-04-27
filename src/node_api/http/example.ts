import http from 'http';
import net from 'net';
import { URL } from 'url';



/**
 * on connect
 */
// 创建 HTTP 隧道代理。
const proxy = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('响应内容');
});
proxy.on('connect', (req, clientSocket, head) => {
  // 连接到原始服务器。
  const { port, hostname } = new URL(`http://${req.url}`);
  const serverSocket = net.connect(parseInt(port) || 80, hostname, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                    'Proxy-agent: Node.js-Proxy\r\n' +
                    '\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });
});

// 代理正在运行。
proxy.listen(1337, '127.0.0.1', () => {

  // 向隧道代理发出请求。
  const options = {
    port: 1337,
    host: '127.0.0.1',
    method: 'CONNECT',
    path: 'nodejs.cn:80'
  };

  const req = http.request(options);
  req.end();

  req.on('connect', (res, socket, head) => {
    console.log('已连接');

    // 通过 HTTP 隧道发出请求。
    socket.write('GET / HTTP/1.1\r\n' +
                 'Host: nodejs.cn:80\r\n' +
                 'Connection: close\r\n' +
                 '\r\n');
    socket.on('data', (chunk) => {
      console.log(chunk.toString());
    });
    socket.on('end', () => {
      proxy.close();
    });
  });
});






/**
 * on upgrade
 */
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('响应内容');
});
server.on('upgrade', (req, socket, head) => {
  socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
               'Upgrade: WebSocket\r\n' +
               'Connection: Upgrade\r\n' +
               '\r\n');

  socket.pipe(socket); // 响应回去。
});

// 服务器正在运行。
server.listen(1337, '127.0.0.1', () => {
  // 发送请求。
  const options = {
    port: 1337,
    host: '127.0.0.1',
    headers: {
      'Connection': 'Upgrade',
      'Upgrade': 'websocket'
    }
  };

  const req = http.request(options);
  req.end();

  req.on('upgrade', (res, socket, upgradeHead) => {
    console.log('接收到响应');
    socket.end();
    process.exit(0);
  });
});







/**
 * request.socket && request.connection
 */
const options = {
  host: 'nodejs.cn',
};
const req = http.get(options);
req.end();
req.once('response', (res) => {
  const ip = req.socket.localAddress;
  const port = req.socket.localPort;
  console.log(`您的 IP 地址是 ${ip}，源端口是 ${port}`);
  // 使用响应对象。
});






/**
 * request.reusedSocket  v13.0.0
 */
const agent = new http.Agent({ keepAlive: true });

function retriableRequest() {
  const req = http
    .get('http://localhost:3000', { agent }, (res) => {
      // ...
    })
    .on('error', (err) => {
      // Check if retry is needed
      if ((<any>req).reusedSocket && (<any>err).code === 'ECONNRESET') {
        retriableRequest();
      }
    });
}

retriableRequest();