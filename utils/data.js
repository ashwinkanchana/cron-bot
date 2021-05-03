const name = process.env.STUDENT_NAME
const usn = process.env.STUDENT_USN
const section = process.env.CLASS_SECTION
const email = process.env.STUEDNT_EMAIL
const telegramAPIkey = process.env.TELEGRAM_API_KEY
const telegramUserID = process.env.TELEGRAM_USER_ID


const subjectsList = [`form1`, `form2`]
const subEnum = {form1: 1, form2: 2 }


const formIDs = {
    form1: `form_1_id`,
    form2: `forn_2_id`,
}


const scheduleOptionsList = {
    form1: [``, ``],
    form2: [``, ``],
}


const generateURL = (subject, scheduleOption, systemDatetime) => {
    var year = (systemDatetime.getFullYear()).toString();
    var month = (systemDatetime.getMonth() + 1).toString();
    var date = (systemDatetime.getDate()).toString();

    const queryStrings = {
        form1: `formResponse?..............`,

        form2: `formResponse?..............`,
    }

    return `https://docs.google.com/forms/d/e/${formIDs[subject]}/${encodeURI(queryStrings[subject])}`
}



//cron exp
const jobStartTime = ['* * * * *', '* * * * *']


const _ = subEnum
const timeTable = {
    1:[],
    2:[],
    3:[],
    4:[],
    5:[],
    6:[]
}


let runningJobs = {}

let formStateHistory = {
    form1: [],
    form2: []
}


module.exports = {
    name, usn, section, email, telegramAPIkey, telegramUserID,
    subjectsList, scheduleOptionsList, formIDs, subEnum, timeTable,
    jobStartTime, runningJobs, formStateHistory, generateURL
}