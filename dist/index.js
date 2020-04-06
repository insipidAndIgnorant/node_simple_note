"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dgram_1 = __importDefault(require("dgram"));
var socket = dgram_1.default.createSocket('udp6');
/**
 * @description socket.on
 * @description socket.bind
 */
socket.on('error', function (err) {
    console.log("\u670D\u52A1\u5668\u5F02\u5E38\uFF1A\n" + err.stack);
    socket.close();
});
socket.on('message', function (msg, rinfo) {
    console.log("\u670D\u52A1\u5668\u6536\u5230\uFF1A" + msg + " \u6765\u81EA " + rinfo.address + ":" + rinfo.port);
});
socket.on('listening', function () {
    var address = socket.address();
    console.log("\u670D\u52A1\u5668\u76D1\u542C " + address.address + ":" + address.port);
});
socket.bind(41234);
/**
 * @description socket.send
 */
var client = dgram_1.default.createSocket('udp4');
// client.send('hello world', 41234, 'localhost', (err) => {
//     client.close();
// });
// or
// client.send([Buffer.from('some'), Buffer.from('date')], 41234, 'localhost', (err) => {
//     client.close();
// });
// or bind romote socket
client.connect(41234, 'localhost', function () {
    client.send('some message', function (err) {
        client.close();
    });
});
//# sourceMappingURL=index.js.map