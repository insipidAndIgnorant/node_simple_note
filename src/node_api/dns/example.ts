import dns, { Resolver } from 'dns';


/**
 * use dns.lookup
 */
dns.lookup('example.org', (err, address, family) => {
    console.log('地址: %j 地址族: IPv%s', address, family);
    // 地址: "93.184.216.34" 地址族: IPv4
});

/**
 * use net dns
 */
dns.resolve4('archive.org', (err, addresses) => {
    if (err) throw err;

    console.log(`地址: ${JSON.stringify(addresses)}`);

    addresses.forEach((a) => {
        dns.reverse(a, (err, hostnames) => {
            if (err) {
                throw err;
            }
            console.log(`地址 ${a} 逆向到: ${JSON.stringify(hostnames)}`);
        });
    });
});




/**
 * set servers, not influence other reslover
 */
const resolver = new Resolver();
resolver.setServers(['4.4.4.4']);
// 此请求将使用 4.4.4.4 中的服务器，与全局设置无关。
resolver.resolve4('example.org', (err, addresses) => {
  // ...
});




/**
 * dns.lookup
 */
const options = {
    family: 6,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
    all: false
};
dns.lookup('example.com', options, (err, address, family) =>
    console.log('地址: %j 地址族: IPv%s', address, family));
// 地址: "2606:2800:220:1:248:1893:25c8:1946" 地址族: IPv6

// 当 options.all 为 true 时，则结果将会是一个数组。
options.all = true;
dns.lookup('example.com', options, (err, addresses) =>
    console.log('地址: %j', addresses));
  // 地址: [{"address":"2606:2800:220:1:248:1893:25c8:1946","family":6}]



/**
 * dns.lookupService
 */
dns.lookupService('127.0.0.1', 22, (err, hostname, service) => {
    console.log(hostname, service);
    // 打印: localhost ssh
});
