require('dotenv').config()
const schedule = require('node-schedule');
const { v4: uuidv4 } = require('uuid');
const { telegramUserID, subjectsList, jobStartTime,
      formStateHistory, timeTable} = require('./utils/data')
const bot = require('./utils/bot');
const { startJob } = require('./utils/scheduler') 
//const parser = require('cron-parser');


//At 08:50 on every day from Monday to Saturday.
const masterSchedule = schedule.scheduleJob('masterSchedule', '50 8 * * 1-6', () => {
     bot.sendMessage(telegramUserID, 'Master scheduler invoked');
     //clear yesterdays history
     for (let key in formStateHistory)
          while (formStateHistory[key].length > 0)
               formStateHistory[key].pop();
     const sysDate = new Date();
     const today = sysDate.getDay();
     const todaysTT = timeTable[today];
     for (let i = 0; i < todaysTT.length; i++) {
          if (todaysTT[i] != -1) {
               const jobName = uuidv4()
               const subjectName = subjectsList[todaysTT[i]]
               var job = schedule.scheduleJob(jobName, jobStartTime[i], function () {
                    startJob(subjectName, jobName)
               });
               job.subjectName = subjectName
          }
     }   
});


// function getTestingCronExpression(i) {
//      var interval = parser.parseExpression('*/5 * * * * *');
//      var fields = JSON.parse(JSON.stringify(interval.fields));
//      const curTime = new Date();
//      fields.hour = [curTime.getHours()];
//      fields.minute = [curTime.getMinutes() + i];
//      var modifiedInterval = parser.fieldsToExpression(fields);
//      return `${((curTime.getSeconds() + 2) % 60)} ${modifiedInterval.stringify()}`;
// }