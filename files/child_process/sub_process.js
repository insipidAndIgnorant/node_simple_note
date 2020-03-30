const { spawn } = require('child_process');
// import { spawn } from "child_process";

const subProcess = spawn('cmd.exe', ['/c', `.\\files\\child_process\\my.bat`], { shell: true });
subProcess.stdout.on('data', (data) => {
    console.log(`sub subProcess on data: ${data}`);
})

subProcess.stderr.on('close', (code) => {
    console.log(`sub subProcess close: code ${code}`);
    subProcess.kill();
})