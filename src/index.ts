import dgram from 'dgram';


const socket = dgram.createSocket('udp6');


socket.bind