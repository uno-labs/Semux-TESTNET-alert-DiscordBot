const { prefix } = require('../config/config-bot.json');
const { semuxBlockchainBlockGetByID, getDelegatesList } = require('../client/extAPIscan.js');
const { numberWithSpaces } = require('../utils.js');


module.exports = {
	name: 'block',
	description: 'Returns a block info by block number',
	aliases: ['b'],
	usage: '<number>',
	cooldown: 5,
	args: true,
	execute:  async function(message, args) {
		const data = [];
		const id = args[0].toLowerCase();
		const re = /^[0-9]{1,9}$/;

		if (!re.test(id)) {
			return message.reply(`The argument does not contain a valid block number!\nYou must send the command \`${prefix}block <number>\` (in \`123...\` format) to get information by block number.`);
		}

		const result = await semuxBlockchainBlockGetByID(id);

		if (result.error) {
			switch (result.status) {
			case 'BLOCK_NOT_FOUND':
				return message.reply(`Block \`${args[0]}\` not found!`);
			}
			return message.reply('Service error');
		}

		const number = numberWithSpaces(result.data.id);
		const time = new Date();
		time.setTime(result.data.timestamp);
		const validator = getDelegatesList().get(result.data.forged_by_addr_hash);

		data.push(`\`\`\`Block number: ${number}`);
		data.push(`Forged by validator: ${validator}`);
		data.push(`Date: ${time}`);
		if (result.data.transactions_count === 1) {
			data.push(`Transactions count: ${result.data.transactions_count} (COINBASE)\`\`\``);
		}
		else {
			data.push(`Transactions count: ${result.data.transactions_count}\`\`\``);
		}

		message.author.send(data, { split: true })
			.then(() => {
				if (message.channel.type === 'dm') return;
				message.reply('I\'ve sent you a DM with info!');
			})
			.catch(() => {
			// console.log(`Could not send help DM to ${message.author.tag}`);
				message.reply('it seems like I can\'t DM you!');
			});

	},
};