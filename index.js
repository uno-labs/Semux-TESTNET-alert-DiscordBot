'use strict';

const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config/config-bot.json');
const bot = new Discord.Client({ disableEveryone: true });
bot.commands = new Discord.Collection();

const { scanDelegatesList, scanNewBlock } = require('./alerts');
const { initialization } = require('./client');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

bot.once('ready', () => {
	initialization();
	console.log(Date(), 'Ready', bot.user.tag);
});


bot.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = bot.commands.get(commandName)
		|| bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

bot.login(token);


// Сканируем список валидаторов каждые 5 минут, отслеживаем активность (ALIVE\WARN\DEAD)
setInterval(async function() {
	const result = await scanDelegatesList();
	if (result.error) {
		return;
	}

	for (const tags of result.alerts) {
		switch (tags.type) {
		case 'missed_block': bot.channels.cache.find(c => c.name === 'uno-labs').send(`В сети TESTNET валидатор https://testnet.semux.top/delegate/${tags.validator} пропускает блоки!`);
			break;
		case 'testnet_stopped': bot.channels.cache.find(c => c.name === 'uno-labs').send(`${tags.date} Сеть TESTNET остановлена!`);
			break;
		}
	}
}, 5 * 60 * 1000);


// Сканируем новый блок каждые 15 сек, отслеживаем транзакции в блоке
/*
Алерты:
- Большое кол-во транзакций в блоке
- Регистрация нового делегата
*/
setInterval(async function() {

	const result = await scanNewBlock();
	if (result.error) {
		return;
	}

	for (const tags of result.alerts) {
		switch (tags.type) {
		case 'big_block': bot.channels.cache.find(c => c.name === 'uno-labs').send(`В сети TESTNET обнаружен поток транзакций!\nБлок https://testnet.semux.top/block/${tags.block} содержит ${tags.count} транзакций`);
			break;
		case 'delegate': bot.channels.cache.find(c => c.name === 'uno-labs').send(`В сети TESTNET зарегистрирован новый делегат!\nhttps://testnet.semux.top/delegate/${tags.name}`);
			break;
		}
	}
}, 15 * 1000);