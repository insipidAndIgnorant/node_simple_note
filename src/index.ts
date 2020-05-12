import http2 from 'http2';
import fs from 'fs';


/**
 * 服务器端示例
 */
// 以下举例说明了一个使用核心 API 的简单的 HTTP/2 服务器。
// 由于没有已知的浏览器支持未加密的 HTTP/2，因此在与浏览器客户端进行通信时必须使用 `http2.createSecureServer()`。
const server = http2.createSecureServer({
  key: fs.readFileSync('./files/http2/密钥.pem'),
  cert: fs.readFileSync('./files/http2/证书.pem')
});
server.on('error', (err) => console.error("server error", err));

server.on('stream', (stream, headers) => {
  // 流是一个双工流。
  stream.respond({
    'content-type': 'text/html',
    ':status': 200
  });
  stream.end('<h1>你好世界</h1>');
});

server.listen(8443);

// 要生成此示例的证书和密钥，可以运行：
// openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
//   -keyout 密钥.pem -out 证书.pem








/**
 * 客户端示例
 */
const client = http2.connect('https://localhost:8443', {
  ca: fs.readFileSync('./files/http2/证书.pem')
});
client.on('error', (err) => console.error("client error", err));

const req = client.request({ ':path': '/' });

req.on('response', (headers, flags) => {
  for (const name in headers) {
    console.log(`${name}: ${headers[name]}`);
  }
});

req.setEncoding('utf8');
let data = '';
req.on('data', (chunk) => { data += chunk; });
req.on('end', () => {
  console.log(`\n${data}`);
  client.close();
});
req.end();




