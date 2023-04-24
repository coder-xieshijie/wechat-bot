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
    .on('ready', async () => {
      // 定义要发送的消息内容
      const messageContent = '晚安，好梦！👀';

      // 定义要发送消息的联系人名称
      const targetContactName = '谢世杰';

      // 创建定时任务，每天的 22:25 执行
      schedule.scheduleJob('33 22 * * *', async () => {
        const targetContact = await bot.Contact.find({ name: targetContactName });

        if (targetContact) {
          await targetContact.say(messageContent);
          console.log(`定时消息已发送给 ${targetContactName}`);
        } else {
          console.log(`未找到联系人 ${targetContactName}`);
        }
      })
    })
    .on('message', async (message: Message) => {
      const sender = message.talker();

      
    })
    ;

  try {
    await bot.start();
  } catch (e) {
    console.error(
      `⚠️ Bot start failed, can you log in through wechat on the web?: ${e}`
    );
  }
}

main();
