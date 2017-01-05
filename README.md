# Raiffeisen Bank Exchange Rate Telegram Bot

## Install

```bash
npm install --production
TOKEN=<your bot token> BOTAN_TOKEN=<your botan token> node bot
```

### supervisord

To use this bot via [Supervisord](supervisord.org) copy `supervisord.conf` to `/etc/supervisor/conf.d/raif-bot.conf` and start it via `supervisorctl`.

```bash
supervisorctl
supervisor> update
raif-telegam-bot: added process group
supervisor> start raif-telegam-bot
```

## License

MIT © [Maxim Ponomarev](https://github.com/maxvipon)
