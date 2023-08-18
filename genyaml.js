const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const directoryPath = 'speedtestresult';
const files = fs.readdirSync(directoryPath);

async function processFile(filePath) {
    return new Promise((resolve, reject) => {
        let rowCount = 0;
        const rows = [];
        const stream = fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                rowCount++;
                rows.push(row);
                // console.log('读取行:', row);
                if (rowCount >= 2) {
                    stream.destroy(); // 停止继续读取文件
                    resolve(rows);
                }
            })
            .on('end', () => {
                resolve(rows);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

async function readFiles() {
    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const filename = path.basename(file, path.extname(file));
        const country = filename.split("-")[0];
        const port = filename.split("-")[2];

        try {
            const rows = await processFile(filePath);
            // console.log('行数据:', rows);
            // console.log('前两行数据读取完毕。');

            const oneNode = `
- name: ${country}-worker
  type: vless
  server: ${rows[0]['IP 地址']}
  port: ${port}
  uuid: uuid
  network: ws
  tls: true
  skip-cert-verify: false
  udp: false
  servername: edgetunnel-worker
  client-fingerprint: chrome
  ws-opts:
    path: "/?ed=2048"
    headers:
      proxyIp: ${rows[1]['IP 地址']}
      host: edgetunnel-worker
        `;

            console.log(oneNode);
        } catch (error) {
            console.error('遇到错误:', error);
        }
    }
}

readFiles();
