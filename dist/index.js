"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dgram_1 = __importDefault(require("dgram"));
var server = dgram_1.default.createSocket('udp4');
server.on('error', function (err) {
    console.log("\u670D\u52A1\u5668\u5F02\u5E38\uFF1A\n" + err.stack);
    server.close();
});
server.on('message', function (msg, rinfo) {
    console.log("\u670D\u52A1\u5668\u63A5\u6536\u5230\u6765\u81EA " + rinfo.address + ":" + rinfo.port + " \u7684 " + msg);
});
server.on('listening', function () {
    var address = server.address();
    console.log("\u670D\u52A1\u5668\u76D1\u542C " + address.address + ":" + address.port);
});
server.bind(41234);
//# sourceMappingURL=index.js.map