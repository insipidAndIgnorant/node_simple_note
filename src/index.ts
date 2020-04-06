import dgram from 'dgram';


const socket = dgram.createSocket('udp6');

/**
 * @description socket.on
 * @description socket.bind
 */
socket.on('error', (err) => {
    console.log(`服务器异常：\n${err.stack}`);
    socket.close();
});

socket.on('message', (msg, rinfo) => {
    console.log(`服务器收到：${msg} 来自 ${rinfo.address}:${rinfo.port}`);
});

socket.on('listening', () => {
    const address = socket.address();
    console.log(`服务器监听 ${address.address}:${address.port}`);
});

socket.bind(41234);


/**
 * @description socket.send
 */
const client = dgram.createSocket('udp4');
client.send('hello world', 41234, 'localhost', (err) => {
    client.close();
});
// or
client.send([Buffer.from('some'), Buffer.from('date')], 41234, 'localhost', (err) => {
    client.close();
});
// or bind romote socket
// add in v12.0.0
// client.connect(41234, 'localhost', () => {
//     client.send('some message', (err) => {
//       client.close();
//     });
// });