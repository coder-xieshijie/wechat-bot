import fs from 'fs';
import ExcelJS, { Row } from 'exceljs';
import axios from 'axios';
import sharp from 'sharp';


async function readExcel(data: Buffer): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(data);

    const worksheet = workbook.getWorksheet(1);
    const outputDir = '/Users/xieshijie/Desktop/down';

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    worksheet.eachRow(async (row: ExcelJS.Row, rowIndex: number) => {
        const sendTime = row.getCell(1).text;
        const sendText = row.getCell(2).text;
        const imageUrl = row.getCell(3).text;

        console.log(`Row ${rowIndex}: SendTime: ${sendTime}, SendText: ${sendText}`);

        if (imageUrl) {
            try {
                const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                const imageBuffer = Buffer.from(response.data);
                const imagePath = `${outputDir}/image_${rowIndex}`;
                const outputFilePath = `${imagePath}.jpg`; // Change the file extension as needed
                await sharp(imageBuffer).toFile(outputFilePath);
                console.log(`Image saved at ${outputFilePath}`);
            } catch (error) {
                console.error(`Error downloading image at row ${rowIndex}:`);
            }
        }
    });
}

// 下载并读取 Excel 文件
async function downloadAndReadExcel(url: string): Promise<void> {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
        });

        const data = new Buffer(response.data);
        await readExcel(data);
    } catch (error) {
        console.error('Error downloading file:', error);
    }
}




// 运行测试函数
// const filePath = '/Users/xieshijie/Desktop/down/test.xlsx';
// testReadExcel(filePath);
const url = 'https://coder-xieshijie-img-1253784930.cos.ap-beijing.myqcloud.com/wechat/test.xlsx';
downloadAndReadExcel(url)
