const fetch = require('node-fetch')
const schedule = require('node-schedule');
const bot = require('./bot');
const { telegramUserID, formIDs, runningJobs, formStateHistory } = require('./data')
module.exports = {
    startJob, stopJob
}
const { sendScheduleOptions } = require('./chatflow')
const maxHistorySize = 60

const checkFormState = async (subject) => {
    console.log(`Checking form ${subject}`)
    const formID = formIDs[subject]
    const url = `https://docs.google.com/forms/d/e/${formID}/viewform`
    const options = { method: "GET", mode: "no-cors", redirect: "follow", referrer: "no-referrer" }
    const response = await fetch(url, options);

    //hh:mm
    const sysTime = (new Date()).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    const timeRegex = /^\S+/
    const time = timeRegex.exec(sysTime)[0];

    //hh:mm:ss
    // const date = new Date()
    // time = date.toTimeString().split(' ')[0]

    let history = formStateHistory[subject]
    if(response.url.endsWith('closedform')){
        history.push({
            time,
            state: 0
        })
        if (history.length > maxHistorySize)
            history.shift()
    }
    else if (response.url.endsWith('viewform')){
        if (history.length>1){
            const prevState = history[history.length - 1].state
            if (prevState == 0) {
                bot.sendMessage(telegramUserID, `${subject} form is accepting responses now`);
                stopJob(subject)
                sendScheduleOptions(subject)
            }
        }
        else if (history.length==0){
            stopJob(subject)
            bot.sendMessage(telegramUserID, `${subject} the form is already open, might've been open from the previous session\n\nThis form is no longer monitored`);
        }
        history.push({
            time,
            state: 1
        })
        if (history.length > maxHistorySize)
            history.shift()
    }

    console.log(formStateHistory)
    console.log(runningJobs)
};

function stopJob(subjectName){
    const jobName = runningJobs[subjectName]
    delete runningJobs[subjectName]
    const completedJob = schedule.scheduledJobs[jobName]
    completedJob.cancel();
}

function startJob(subjectName, jobName){
    if(runningJobs[subjectName]!=undefined)
        stopJob(subjectName)
    runningJobs[subjectName] = jobName
    const startTime = new Date();
    
    //max runtime
    const endTime = new Date();

    //check every minute
    const job = schedule.scheduleJob(jobName, { start: startTime, end: endTime, rule: '* * * * *' }, function (){
        if(this.subjectName!=undefined)
            checkFormState(this.subjectName)
    });
    job.subjectName = subjectName
}

