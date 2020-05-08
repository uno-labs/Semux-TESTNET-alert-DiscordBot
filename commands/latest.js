// const { prefix } = require('../config/config-bot.json');
const { semuxBlockchainBlockGetLast, getDelegatesList } = require('../client/extAPIscan.js');
const { numberWithSpaces } = require('../utils.js');


module.exports = {
	name: 'latest',
	description: 'Get latest block.',
	aliases: ['l'],
	usage: '',
	cooldown: 5,
	execute:  async function(message) {
		const data = [];
		const result = await semuxBlockchainBlockGetLast();
		if (result.error) {
			return message.reply('Service error');
		}
		const number = numberWithSpaces(result.data.id);
		const time = new Date();
		time.setTime(result.data.timestamp);
		const validator = getDelegatesList().get(result.data.forged_by_addr_hash);

		data.push(`\`\`\`Latest block number: ${number}`);
		data.push(`Forged by validator: ${validator}`);
		data.push(`Date: ${time}`);
		if (result.data.transactions_count === 1) {
			data.push(`Transactions count: ${result.data.transactions_count} (COINBASE)\`\`\``);
		}
		else {
			data.push(`Transactions count: ${result.data.transactions_count}\`\`\``);
		}

		// console.log(result);
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