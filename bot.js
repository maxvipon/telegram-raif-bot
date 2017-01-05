'use strict';

const cl = require('chalk');
const TelegramBot = require('node-telegram-bot-api');
const botan = require('botanio')(process.env.BOTAN_TOKEN);

const got = require('./got');
const log = require('./logger');

const URL = 'https://online.raiffeisen.ru/rest/exchange/rate?amount=1&amountInSrcCurrency=true&currencyDest=RUR&currencySource=USD&scope=4';

const bot = new TelegramBot(process.env.TOKEN, {polling: true});

const MARKUP = JSON.stringify({
    keyboard: [
        ['Помощь']
    ],
    one_time_keyboard: true
});

const HELP = 'Задай пороговое значение курса и интервал обновления в секундах в формате `/set 65.05 120`';

const cache = new Map();

bot.getMe().then(me => {
    log.info('Hi! My name is ' + cl.blue('@' + me.username));
    log.info('Me:', me);
});

bot.onText(/\/set \d+\.\d+ \d+/, msg => {
    let chatId = msg.chat.id;
    let opts = {
        keyboard: MARKUP,
        parse_mode: 'Markdown'
    };

    let text = msg.text.split(' ');
    let threshold = Number(text[1]);
    let interval = Number(text[2]);

    let chat = cache.get(chatId);

    if (chat) {
        clearInterval(chat.timer);
        cache.delete(chatId);
    }

    cache.set(chatId, {
        threshold: threshold,
        interval: interval,
        timer: setInterval(function () {
            send(chatId, threshold);
        }, interval * 1000)
    });

    bot.sendMessage(chatId, `Принят порог ${threshold.toFixed(2)}₽ с обновлением раз в ${interval} сек.`, opts);
    send(chatId);
    botan.track(msg, 'Set');
});

bot.onText(/\?/, msg => {
    let chatId = msg.chat.id;
    send(chatId);
    botan.track(msg, 'Question');
});

bot.onText(/\/stop/, msg => {
    let chatId = msg.chat.id;
    let chat = cache.get(chatId);
    clearInterval(chat.timer);
    cache.delete(chatId);
    bot.sendMessage(chatId, `Вы отписались от уведомлений`);
    botan.track(msg, 'Stop');
});

bot.onText(/^\/start|\/help|Помощь$/, msg => {
    let chatId = msg.chat.id;
    let opts = {
        parse_mode: 'Markdown'
    };
    bot.sendMessage(chatId, HELP, opts);
    botan.track(msg, 'Start');
});

bot.on('error', err => log.error(err));

function send(chatId, threshold) {
    threshold = threshold || 0;

    let prevRate = 0;

    got(URL, {json: true})
        .then(res => {
            let data = res.body;

            if (!data) {
                return;
            }

            let rate = data.rate;

            if (rate === prevRate || rate < threshold) {
                return;
            }

            bot.sendMessage(chatId, `1$ = ${rate}₽`);
            prevRate = rate;
        })
        .catch(ex => log.error(ex));
}
