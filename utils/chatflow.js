const bot = require('./bot');
const { v4: uuidv4 } = require('uuid');
const { name, telegramUserID, subjectsList, scheduleOptionsList } = require('./data')
const { submitForm } = require('./submit')
const { sendGraph } = require('./plotter')
const { formStateHistory,  runningJobs } = require('./data')
const { startJob } = require('./scheduler')


const sendSubjectsList = () => {
    const options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: subjectsList[0], callback_data: `#${subjectsList[0]}` }, {
                    text: subjectsList[1], callback_data: `#${subjectsList[1]}`
                }],
                [{
                    text: subjectsList[2], callback_data: `#${subjectsList[2]}`
                }, {
                    text: subjectsList[3], callback_data: `#${subjectsList[3]}`
                }],
                [{ text: subjectsList[4], callback_data: `#${subjectsList[4]}` }, {
                    text: subjectsList[5], callback_data: `#${subjectsList[5]}`
                }],
                [{
                    text: subjectsList[6], callback_data: `#${subjectsList[6]}`
                }, {
                    text: subjectsList[7], callback_data: `#${subjectsList[7]}`
                }],
                [{ text: subjectsList[8], callback_data: `#${subjectsList[8]}` }]
            ]
        })
    }
    bot.sendMessage(telegramUserID, 'Choose subject:', options);
}

const sendScheduleOptions = (subject) => {
    const selectedSchedule = scheduleOptionsList[subject]
    const numberOfOptions = selectedSchedule.length - 1;
    console.log(numberOfOptions)
    let inline_keyboard = []
    if (numberOfOptions == 2) {
        inline_keyboard = [
            [{ text: selectedSchedule[1], callback_data: `$${subject}#${selectedSchedule[1]}` }],
            [{ text: selectedSchedule[2], callback_data: `$${subject}#${selectedSchedule[2]}` }]
        ]
    }
    else if (numberOfOptions == 4) {
        inline_keyboard = [
            [{
                text: selectedSchedule[1], callback_data: `$${subject}#${selectedSchedule[1]}`
            }],
            [{ text: selectedSchedule[2], callback_data: `$${subject}#${selectedSchedule[2]}` }],
            [{
                text: selectedSchedule[3], callback_data: `$${subject}#${selectedSchedule[3]}`
            }],
            [{ text: selectedSchedule[4], callback_data: `$${subject}#${selectedSchedule[4]}` }],
        ]
    }
    else if (numberOfOptions == 7) {
        inline_keyboard = [
            [{
                text: selectedSchedule[1], callback_data: `$${subject}#${selectedSchedule[1]}`
            }, { text: selectedSchedule[2], callback_data: `$${subject}#${selectedSchedule[2]}` }],

            [{ text: selectedSchedule[3], callback_data: `$${subject}#${selectedSchedule[3]}` },
            { text: selectedSchedule[4], callback_data: `$${subject}#${selectedSchedule[4]}` }],

            [{
                text: selectedSchedule[5], callback_data: `$${subject}#${selectedSchedule[5]}`
            },
            {
                text: selectedSchedule[6], callback_data: `$${subject}#${selectedSchedule[6]}`
            }],
            [{ text: selectedSchedule[7], callback_data: `$${subject}#${selectedSchedule[7]}` }]
        ]
    }
    else {
        inline_keyboard = [
            [{
                text: selectedSchedule[1], callback_data: `$${subject}#${selectedSchedule[1]}`
            }, { text: selectedSchedule[2], callback_data: `$${subject}#${selectedSchedule[2]}` }],

            [{ text: selectedSchedule[3], callback_data: `$${subject}#${selectedSchedule[3]}` },
             { text: selectedSchedule[4], callback_data: `$${subject}#${selectedSchedule[4]}` }],
            
            [{
                text: selectedSchedule[5], callback_data: `$${subject}#${selectedSchedule[5]}`}, 
                {text: selectedSchedule[6], callback_data: `$${subject}#${selectedSchedule[6]}`
            }],

            [{ text: selectedSchedule[7], callback_data: `$${subject}#${selectedSchedule[7]}` }, 
            {text: selectedSchedule[8], callback_data: `$${subject}#${selectedSchedule[8]}`
            }]
        ]
    }
    const options = {
        reply_markup: JSON.stringify({
            inline_keyboard
        })
    }
    bot.sendMessage(telegramUserID, 'Choose class time:', options);
}


const sendSubjectsListForAction = (action) => {
    const options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: subjectsList[0], callback_data: `${action}#${subjectsList[0]}` }, { text: subjectsList[1], callback_data: `${action}#${subjectsList[1]}` }],
                [{ text: subjectsList[2], callback_data: `${action}#${subjectsList[2]}` }, { text: subjectsList[3], callback_data: `${action}#${subjectsList[3]}` }],
                [{ text: subjectsList[4], callback_data: `${action}#${subjectsList[4]}` }, { text: subjectsList[5], callback_data: `${action}#${subjectsList[5]}` }],
                [{ text: subjectsList[6], callback_data: `${action}#${subjectsList[6]}` }, { text: subjectsList[7], callback_data: `${action}#${subjectsList[7]}` }],
                [{ text: subjectsList[8], callback_data: `${action}#${subjectsList[8]}` }]
            ]
        })
    }
    bot.sendMessage(telegramUserID, `Choose subject for action (${action}):`, options);
}

bot.on('callback_query', (callbackQuery) => {
    const action = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;
    console.log(action)
    //#SUBNAME
    if (action.startsWith('#')) {
        const subject = action.substring(1)
        bot.deleteMessage(telegramUserID, messageId)
        sendScheduleOptions(subject)
    }
    //$SUBNAME#SCHEDULE_OPTION
    else if (action.startsWith('$')) {
        const lis = action.split('#')
        const subject = lis[0].substring(1)
        const schedule = lis[1]
        console.log(subject)
        console.log(schedule)
        bot.deleteMessage(telegramUserID, messageId)
        bot.sendMessage(telegramUserID, 'Submitting form, please wait...');
        const systemDateTime = new Date();
        submitForm(subject, schedule, systemDateTime)
    }
    //stat#SUBNAME
    else if (action.startsWith('stat#')) {
        const statSubject = action.substring(5)
        bot.deleteMessage(telegramUserID, messageId)
        if (formStateHistory[statSubject].length==0){
            bot.sendMessage(telegramUserID, `Negative, no intel on ${statSubject}`);
        }
        else{
            bot.sendMessage(telegramUserID, `Plotting graph for ${statSubject}...`);
            sendGraph(statSubject)
        }
        
    }
    //add#SUBNAME
    else if (action.startsWith('add#')) {
        const addSubName = action.substring(4)
        bot.deleteMessage(telegramUserID, messageId)
        const jobName = uuidv4()
        startJob(addSubName, jobName)
        bot.sendMessage(telegramUserID, `Added ${addSubName} to watchlist`);
    }
});

bot.on('polling_error', console.log);


bot.onText(/\/start/, (msg, options) => {
    bot.sendMessage(telegramUserID, `Hi ${name} \nYou can use /help to see all commands`);
});


bot.onText(/\/help/, (msg, options) => {
    bot.sendMessage(telegramUserID, `Hi  : Interactive form submission\n\nintel  : See form staus graph\n\ntask  : List of currently running jobs\n\nadd  : Manually add a new task`);
});


bot.onText(/[Hh][Ii]/, (msg, options) => {
    sendSubjectsList()
});


bot.onText(/[Ii]ntel/, (msg, options) => {
    sendSubjectsListForAction('stat')
});


bot.onText(/[Tt]ask[s]?/, (msg, options) => {
    if(runningJobs && Object.keys(runningJobs).length === 0 && runningJobs.constructor === Object)
        bot.sendMessage(telegramUserID, `Currently no running tasks`)
    else{
        let tasksList = 'Running tasks:\n'
        for (let key in runningJobs) {
            tasksList += `${key}\n`
        }
        bot.sendMessage(telegramUserID, tasksList)
    }
});


bot.onText(/[Aa]dd/, (msg, options) => {
    sendSubjectsListForAction('add')
});



module.exports = {
    sendSubjectsList, sendScheduleOptions
}