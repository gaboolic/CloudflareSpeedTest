const https = require('https');
const unzipper = require('unzipper');
const fs = require('fs');
const path = require('path');

const directory = 'txt';

// 递归删除目录下的所有文件
function deleteFiles(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(file => {
            const filePath = path.join(dirPath, file);

            if (fs.statSync(filePath).isDirectory()) {
                deleteFiles(filePath); // 递归删除子目录中的文件
            } else {
                fs.unlinkSync(filePath); // 删除文件
                console.log(`删除文件: ${filePath}`);
            }
        });
    }
}

deleteFiles(directory);


const zipUrl = 'https://zip.baipiao.eu.org/';

// 创建输出文件流
const outputStream = fs.createWriteStream('file.zip');

// 发起HTTPS请求并下载文件
https.get(zipUrl, response => {
    // 将下载的数据流写入输出文件流
    response.pipe(outputStream);

    // 当下载完成时
    outputStream.on('finish', () => {
        console.log('文件下载完成');

        // 关闭输出文件流
        outputStream.close();

        // 解压缩文件
        fs.createReadStream('file.zip')
            .pipe(unzipper.Extract({ path: 'txt' }))
            .on('close', () => {
                console.log('文件解压完成');
            });
    });
}).on('error', err => {
    console.error('下载文件时遇到错误:', err);
});
