const fs = require('fs')
const vega = require('vega');
const bot = require('./bot');
const {formStateHistory, telegramUserID} = require('./data')

const plotGraph = (spec) => {
    return new Promise((resolve, reject) => {
        var view = new vega.View(vega.parse(spec), { renderer: 'none' });
        view.toCanvas()
            .then((canvas) => {
                const out = fs.createWriteStream(__dirname + '/graph.png')
                const stream = canvas.createPNGStream()
                stream.pipe(out)
                out.on('finish', () => {
                    resolve(true)
                })
            })
            .catch((err) => {
                reject(Error(err));
            })
    });
};

const sendGraph = (subject) => {
    const spec = require('./graph.json')
    spec.data[0].values = formStateHistory[subject]
    plotGraph(spec)
        .then((isGraphPlotted) => {
            if (isGraphPlotted) {
                console.log("Plotted graph")
                //bot.sendPhoto(telegramUserID, './graph.png', { caption: `${subject}` })
                bot.sendDocument(telegramUserID, './graph.png', { caption: `${subject} uncompressed` })
            }
        }).catch((err) => {
            bot.sendMessage(telegramUserID, `Couldn't plot a graph for ${statSubject}`);
        })
};

module.exports = {
    sendGraph
}