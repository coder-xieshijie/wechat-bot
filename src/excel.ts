import fs from 'fs';
import ExcelJS, { Row } from 'exceljs';

async function readExcel(data: Buffer): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(data);

  const worksheet = workbook.getWorksheet(1);

  worksheet.eachRow((row: Row, rowIndex: number) => {
    console.log(`Row ${rowIndex}: ${JSON.stringify(row.values)}`);
  });
}

// 测试函数
async function testReadExcel(filePath: string): Promise<void> {
  fs.readFile(filePath, async (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    await readExcel(data);
  });
}
async function readFileExcel(file: File): Promise<void> {
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const { result } = event.target as FileReader;
        if (result instanceof ArrayBuffer) {
          resolve(Buffer.from(result));
        } else {
          reject(new Error('Unexpected result from FileReader'));
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
  
    const worksheet = workbook.getWorksheet(1);
  
    worksheet.eachRow((row: Row, rowIndex: number) => {
      console.log(`Row ${rowIndex}: ${JSON.stringify(row.values)}`);
    });
  }

// 运行测试函数
// testReadExcel();
