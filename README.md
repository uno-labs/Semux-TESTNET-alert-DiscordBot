# Semux-TESTNET-alert-DiscordBot

Bot for notifications of events on the Semux TESTNET blockchain https://github.com/semuxproject/semux-core/blob/master/docs/Testnet.md. 
The bot checks transaction information in blocks, and also monitors the activity of validators, and fires automatic alerts.

Bot uses capability of Semux Extended API https://testnet.semux.top/api
Specification on https://github.com/uno-labs/semux_pool_client

## Event alerts
- Validator missed block
- The block contains a lot of transactions
- New delegate registered in TESTNET
- TESTNET blockchain stopped

## Commands
 
- help -- return list of commands and example uses
- latest -- return info about latest block
- account <address> -- return info about account
- block <number> -- return info by number block
- delegate <name> -- return info about delegate or validator by name
 
## Setup and run
* change bot configuration settings in ./config/config-bot.json file
* cd Semux-alert-DiscordBot
* npm install
* node index.js
