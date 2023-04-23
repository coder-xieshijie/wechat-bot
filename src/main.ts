import { WechatyBuilder, Message } from 'wechaty';
import { FileBox } from 'file-box';
import QRCode from "qrcode";
import { ChatGPTBot } from "./bot.js";
import { config } from "./config.js";
import schedule from 'node-schedule';
import pkg from 'exceljs';
const { Workbook } = pkg;
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import ExcelJS, { Row } from 'exceljs';


const chatGPTBot = new ChatGPTBot();

// 用于存储发送任务的数据结构
interface Task {
  sendTime: any;
  sendText: any;
  sendImagePath: any;
}

const tasks: Task[] = [];
const savePath = '/Users/xieshijie/Desktop/down';

const bot = WechatyBuilder.build({
  name: "wechat-assistant", // generate xxxx.memory-card.json and save login data for the next login
  puppet: "wechaty-puppet-wechat",
  puppetOptions: {
    uos: true
  }
});
// send group message
async function sendScheduledMessageToGroup(
  groupName: string,
  messageText: string,
  imgPath: string
) {
  const targetGroup = await bot.Room.find({ topic: groupName });

  if (!targetGroup) {
    console.log(`未找到群组: ${groupName}`);
    return;
  }

  targetGroup.say(messageText);
  const fileBox = FileBox.fromFile(imgPath);
  targetGroup.say(fileBox);
}
async function main() {
  const initializedAt = Date.now()
  const groupName = '猫猫测试群';
  const messageText = '📣千载难逢，历史机遇！\n🥁全员参战，势在必得！\n🏆目标不设限，收入大爆发！\n⏰首爆产品上线开闸倒计时1⃣小时！';
  const targetDate = new Date(2023, 3, 21, 22, 53); // 注意：月份是从 0 开始的，所以这里使用 3 代表 4 月
  const imgPath = "/Users/xieshijie/Desktop/WechatIMG10.jpeg";

  schedule.scheduleJob(targetDate, () => {
    sendScheduledMessageToGroup(groupName, messageText, imgPath);
  });

  bot
    .on("scan", async (qrcode, status) => {
      const url = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
      console.log(`Scan QR Code to login: ${status}\n${url}`);
      console.log(
        await QRCode.toString(qrcode, { type: "terminal", small: true })
      );
    })
    .on("login", async (user) => {
      chatGPTBot.setBotName(user.name());
      console.log(`User ${user} logged in`);
      console.log(`私聊触发关键词: ${config.chatPrivateTriggerKeyword}`);
      console.log(`已设置 ${config.blockWords.length} 个聊天关键词屏蔽. ${config.blockWords}`);
      console.log(`已设置 ${config.chatgptBlockWords.length} 个ChatGPT回复关键词屏蔽. ${config.chatgptBlockWords}`);
    })
    // .on("message", async (message) => {
    //   if (message.date().getTime() < initializedAt) {
    //     return;
    //   }
    //   if (message.text().startsWith("/ping")) {
    //     await message.say("pong");
    //     return;
    //   }
    //   try {
    //     await chatGPTBot.onMessage(message);
    //   } catch (e) {
    //     console.error(e);
    //   }
    // })
    // .on('ready', async () => {
    //   // 定义要发送的消息内容
    //   const messageContent = '晚安，好梦！👀';

    //   // 定义要发送消息的联系人名称
    //   const targetContactName = '谢世杰';

    //   // 创建定时任务，每天的 22:25 执行
    //   schedule.scheduleJob('33 22 * * *', async () => {
    //     const targetContact = await bot.Contact.find({ name: targetContactName });

    //     if (targetContact) {
    //       await targetContact.say(messageContent);
    //       console.log(`定时消息已发送给 ${targetContactName}`);
    //     } else {
    //       console.log(`未找到联系人 ${targetContactName}`);
    //     }
    //   })
    // })
    // .on('message', async (message: Message) => {
    //   const sender = message.talker();

    //   if (sender && sender.name() === '谢世杰123' && message.type() === bot.Message.Type.Attachment) {
    //     const attachment = await message.toFileBox();
    //     console.log(`attachment name: ${attachment.name}`);

    //     if (attachment.name.endsWith('.xlsx')) {
    //       try {
    //         const fileContent = await attachment.toBuffer;
    //         const workbook = new Workbook();
    //         // readExcel(fileContent);
    //         // await workbook.xlsx.load(fileContent);
    //         // const worksheet = workbook.getWorksheet(1);
    //         // const tasks: Task[] = [];

    //         // worksheet.eachRow((row, rowIndex) => {
    //         //   if (rowIndex > 1) {
    //         //     const sendTime = row.getCell(1).value;
    //         //     const sendText = row.getCell(2).value;
    //         //     const sendImagePath = row.getCell(3).value;

    //         //     tasks.push({ sendTime, sendText, sendImagePath });
    //         //   }
    //         // });

    //         // console.log("tasks info == " + JSON.stringify(tasks, null, 2));
    //         // updateScheduledTasks(tasks);
    //       } catch (error) {
    //         console.error(`Error parsing Excel file: ${error}`);
    //       }
    //     }
    //   }
    // })
    .on('message', async (message: Message) => {
      // 检查消息类型是否为附件
      if (message.type() === bot.Message.Type.Attachment) {
        try {
          // 获取 FileBox 对象
          const fileBox = await message.toFileBox();
    
          // 获取文件名
          const fileName = fileBox.name;
    
          // 设置保存文件的路径
          const filePath = path.join(savePath, fileName);
          console.log(`Saving file: ${fileName} (${fileBox.size} bytes)`);
    
          // 将文件保存到本地指定目录
          await fileBox.toFile(filePath, true);
    
          console.log(`File saved to: ${filePath}`);
        } catch (error) {
          console.error(`Error saving file: ${error}`);
        }
      }
    });


  try {
    await bot.start();
  } catch (e) {
    console.error(
      `⚠️ Bot start failed, can you log in through wechat on the web?: ${e}`
    );
  }
}

// 读取 Excel 文件
async function readExcel(buffer: Buffer): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  const worksheet = workbook.getWorksheet(1)

  worksheet.eachRow((row: Row, rowIndex: number) => {
    console.log(`Row ${rowIndex}: ${JSON.stringify(row.values)}`)
  })
}
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


function updateScheduledTasks(tasks: Task[]): void {
  // 清空当前的定时任务

  // 根据新的任务列表创建定时任务

  // ...
}
main();
