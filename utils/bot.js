const TelegramBot = require('node-telegram-bot-api');
const { telegramAPIkey } = require('./data')
const bot = new TelegramBot(telegramAPIkey, { polling: true });
module.exports = bot;