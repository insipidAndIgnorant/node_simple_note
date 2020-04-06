import cluster from 'cluster';
import http from 'http';
import os from 'os';



// example1
const numCPUs = os.cpus().length;
if (cluster.isMaster) {
    console.log(`主进程 ${process.pid} 正在运行`);
  
    // 衍生工作进程。
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on('exit', (worker, code, signal) => {
      console.log(`工作进程 ${worker.process.pid} 已退出`);
    });
  } else {
    // 工作进程可以共享任何 TCP 连接。
    // 在本例子中，共享的是 HTTP 服务器。
    http.createServer((req, res) => {
      res.writeHead(200);
      res.end('你好世界\n');
    }).listen(8000);
  
    console.log(`工作进程 ${process.pid} 已启动`);
  }



  // setupMaster
  cluster.setupMaster({
    exec: 'worker.js',
    args: ['--use', 'https'],
    silent: true
  });
  cluster.fork(); // https 工作进程
  cluster.setupMaster({
    exec: 'worker.js',
    args: ['--use', 'http']
  });
  cluster.fork(); // http 工作进程

