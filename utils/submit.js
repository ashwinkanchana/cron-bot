const fetch = require('node-fetch')
const cheerio = require('cheerio')
const chalk = require('chalk')
const nodeHtmlToImage = require('node-html-to-image')
const bot = require('./bot');
const { name, usn, section, email, telegramUserID, generateURL } = require('./data')


const submitForm = async (subject, scheduleOption, systemDateTime) => {
    const url = generateURL(subject, scheduleOption, systemDateTime)
    const options = { method: "POST", mode: "no-cors", redirect: "follow", referrer: "no-referrer" }
    const response = await fetch(url, options);
    const httpStatusCode = await response.status
    const httpStatusMessage = await response.statusText
    const htmlBody = await response.text();
    const DOM = cheerio.load(htmlBody);

    notify(httpStatusCode, httpStatusMessage, url, subject, scheduleOption, systemDateTime, DOM)
};


function notify(httpStatusCode, httpStatusMessage, url, subject, scheduleOption, systemDatetime, DOM) {
    const year = (systemDatetime.getFullYear()).toString();
    const month = (systemDatetime.getMonth() + 1).toString();
    const date = (systemDatetime.getDate()).toString();

    const formFillData = `${subject}\n${name}\n${usn}\n${section} Section\n${email}\n${date}/${month}/${year}  ${scheduleOption}`

    if (httpStatusCode >= 300) {
        //Unsuccessful (Requires login. etc)
        bot.sendMessage(telegramUserID, `${httpStatusCode} - ${httpStatusMessage}\nRequires login\n\nClick on the pre-filled link to submit\n\n${formFillData}\n\n${url}`);
    }

    //Successful form submission
    DOM('.freebirdFormviewerViewResponseConfirmationMessage').each((i, title) => {
        bot.sendMessage(telegramUserID, DOM(title).text());
    });

    //Unsuccessful (form closed etc.)
    let unsuccessful = false
    DOM('.freebirdFormviewerViewResponseMessage').each((i, title) => {
        bot.sendMessage(telegramUserID, DOM(title).text());
        unsuccessful = true
    });

    bot.sendMessage(telegramUserID, 'Capturing screenshot...');

    nodeHtmlToImage({
        output: './screenshot.png',
        html: DOM.html()
    }).then(() => {
        console.log(chalk.cyan('Captured screenshot'))
        if (unsuccessful)
            bot.sendPhoto(telegramUserID, './screenshot.png', { caption: `Unable to fill\n${subject}  ${scheduleOption}` })
        else
            bot.sendPhoto(telegramUserID, './screenshot.png', { caption: `${formFillData}` })
    })
}


module.exports = {
    submitForm
}