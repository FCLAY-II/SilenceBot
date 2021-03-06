require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.TG_TOKEN, {
  polling: true,
});

bot.on('voice', (msg) => {
  const stream = bot.getFileStream(msg.voice.file_id);

  const chunks = [];

  stream.on('data', (chunk) => chunks.push(chunk));
  stream.on('end', async () => {
    const axiosConfig = {
      method: 'POST',
      url: 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize',
      headers: {
        Authorization: `Api-Key ${process.env.API_YA_KEY}`,
      },
      data: Buffer.concat(chunks),
    };
    try {
      const response = await axios(axiosConfig);
      const { result } = response.data;
      const { id } = msg.chat;
      const { first_name } = msg.from;
      bot.sendMessage(id, `${first_name} говорит:\n${result}`);
    } catch (e) {
      console.log('Error:', e);
    }
  });
});
