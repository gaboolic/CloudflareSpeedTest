const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const directory = 'speedtestresult';

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

// https://zip.baipiao.eu.org/
async function readAllFilenames(directoryPath) {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const fileLines = await countLines(filePath);
        console.log(`文件 ${filePath} 的行数为: ${fileLines}`);

        // 在这里添加条件语句以判断是否跳过文件
        if (fileLines < 10) {
            continue;
        }

        const filename = path.basename(file, path.extname(file));
        const fileNameWithFullPath = directoryPath + "/" + file;
        const country = filename.split("-")[0];
        const port = filename.split("-")[2];
        if (port != 443) {
            continue;
        }
        const cmd = `shell/CloudflareST -f ${fileNameWithFullPath} -o speedtestresult/${filename}.csv -tp ${port} -url https://cloudflare.cdn.openbsd.org/pub/OpenBSD/7.3/src.tar.gz -sl 5`;
        console.log(cmd);

        try {
            const output = execSync(cmd);
            console.log(`${filename}处理完成`);
        } catch (error) {
            console.error(`执行命令时发生错误: ${error}`);
        }
    }
}

// 统计文件行数并返回 Promise 对象
function countLines(filePath) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let lineCount = 0;
        rl.on('line', line => {
            lineCount++;
        });

        rl.on('close', () => {
            resolve(lineCount);
        });

        fileStream.on('error', error => {
            reject(error);
        });
    });
}

// 调用函数读取文件名
readAllFilenames('txt');
