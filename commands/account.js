const { prefix } = require('../config/config-bot.json');
const { getDelegatesList, semuxBlockchainAddressGet } = require('../client');
const { compareObjects, numberWithSpaces, numberAlignRight } = require('../utils');

module.exports = {
	name: 'account',
	description: 'Information about your Semux account',
	aliases: ['address', 'a'],
	usage: '<address 0x..>',
	cooldown: 10,
	args: true,
	execute:  async function(message, args) {
		const data = [];
		const account = args[0].toLowerCase();
		const re = /^(0x)?[0-9a-f]{40}$/;

		if (!re.test(account)) {
			return message.reply(`The argument does not contain a valid address!\nYou must send the command \`${prefix}account <address>\` (in \`0x...\` format) to get account information.`);
		}

		const result = await semuxBlockchainAddressGet(account);

		if (result.error) {
			switch (result.status) {
			case 'ADDRESS_NOT_FOUND':
				return message.reply(`Address \`${args[0]}\` not found!`);
			}
			return message.reply('Service error');
		}

		const balance = (parseInt(result.data.total_balance, 10) / 1e9).toFixed(2);
		const spendable = (parseInt(result.data.spendable_balance, 10) / 1e9).toFixed(2);
		const locked = (parseInt(result.data.vote_balance, 10) / 1e9).toFixed(2);
		const received = (parseInt(result.data.total_in_sum, 10) / 1e9).toFixed(2);
		const sent = (parseInt(result.data.total_out_sum, 10) / 1e9).toFixed(2);
		const maxBalance = (parseInt(result.data.history_max_balance, 10) / 1e9).toFixed(2);
		const lastActivity = new Date();
		lastActivity.setTime(result.data.last_active_ts);

		// проверка, если аккаунт зарегистрирован как делегат
		if (result.data.name.length) {
			const stack = (parseInt(result.data.delegate_state.votes_sum, 10) / 1e9).toFixed(2);
			data.push(`\`\`\`Name:    ${result.data.name}`);
			data.push(`Account: ${result.data.addr}\`\`\`\`\`\``);
			data.push(`Total Balance: ${balance} SEM`);
			data.push(`Spendable:     ${spendable} SEM`);
			data.push(`Locked:        ${locked} SEM\`\`\`\`\`\``);
			data.push(`Votes:    ${stack} SEM`);
			data.push(`Position: ${result.data.delegate_pos} of 100`);
			data.push(`Status:   ${result.data.state}`);
			data.push(`Activity: ${result.data.alive_state}`);
			if (locked === '0.00') {
				data.push(`UpTime:   ${result.data.uptime_percent} %\`\`\``);
			}
			else {
				data.push(`UpTime:   ${result.data.uptime_percent} %\`\`\`\`\`\`\nVotes:`);
				const tempList = [];
				for (const i in result.data.votes_dist) {
					tempList.push({ addr: i, votes: result.data.votes_dist[i] });
				}
				tempList.sort(compareObjects);

				for (let i = 0; i < tempList.length; i++) {
					const votes = numberAlignRight(numberWithSpaces((parseInt(tempList[i].votes, 10) / 1e9).toFixed(2)));
					const validator = getDelegatesList().get(tempList[i].addr);
					data.push(`${votes}   ->   ${validator}`);
				}
				data.push('```');
			}
		}
		else {
			data.push(`\`\`\`Account:        ${result.data.addr}`);
			data.push(`Total Balance:        ${balance} SEM`);
			data.push(`Spendable:            ${spendable} SEM`);
			data.push(`Locked:               ${locked} SEM\`\`\`\`\`\``);
			data.push(`Max historic balance: ${maxBalance} SEM`);
			data.push(`Transactions count:   ${result.data.transactions_count}`);
			data.push(`Total received:       ${received} SEM`);
			data.push(`Total sent:           ${sent} SEM`);
			if (locked === '0.00') {
				data.push(`Last activity:        ${lastActivity.toDateString()}\`\`\``);
			}
			else {
				data.push(`Last activity:        ${lastActivity.toDateString()}\`\`\`\`\`\`\nVotes:`);
				const tempList = [];
				for (const i in result.data.votes_dist) {
					tempList.push({ addr: i, votes: result.data.votes_dist[i] });
				}
				tempList.sort(compareObjects);

				for (let i = 0; i < tempList.length; i++) {
					const votes = numberWithSpaces((parseInt(tempList[i].votes, 10) / 1e9).toFixed(2));
					const validator = getDelegatesList().get(tempList[i].addr);
					data.push(`${votes}   ->   ${validator}`);
				}
				data.push('```');
			}
		}

		if (!data.length) {
			data.push('Unknown account.');
		}

		message.author.send(data, { split: true })
			.then(() => {
				if (message.channel.type === 'dm') return;
				message.reply('I\'ve sent you a DM with info!');
			})
			.catch(() => {
				console.log(Date(), 'Could not send DM to', message.author.tag);
				message.reply('it seems like I can\'t DM you!');
			});

	},
};