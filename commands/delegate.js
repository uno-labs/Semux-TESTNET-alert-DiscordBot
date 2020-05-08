const { prefix } = require('../config/config-bot.json');
const { semuxBlockchainDelegatesGet } = require('../client/extAPIscan.js');
// const { compareObjects, numberWithSpaces } = require('../utils.js');


module.exports = {
	name: 'delegate',
	description: 'General information about Semux delegate account. You must provide a delegate name registered on the Semux network. For example `semux1`',
	aliases: ['validator', 'pool', 'd'],
	usage: '<name>',
	cooldown: 5,
	args: true,
	execute:  async function(message, args) {
		const data = [];

		if (args.length) {
			const name = args[0].toLowerCase();
			const re = /^[0-9_a-z]{4,16}$/;

			if (!re.test(name)) {
				return message.reply('Invalid delegate name!');
			}

			const result = await semuxBlockchainDelegatesGet();
			if (result.error) {
				return message.reply('Service error');
			}
			for (const delegate of result.data) {
				if (name === delegate.name) {
					const balance = (parseInt(delegate.total_balance, 10) / 1e9).toFixed(2);
					const spendable = (parseInt(delegate.spendable_balance, 10) / 1e9).toFixed(2);
					const locked = (parseInt(delegate.vote_balance, 10) / 1e9).toFixed(2);
					const votes = (parseInt(delegate.delegate_state.votes_sum, 10) / 1e9).toFixed(2);

					data.push(`\`\`\`Name:    ${delegate.name}`);
					data.push(`Account: ${delegate.addr}\`\`\`\`\`\``);
					data.push(`Total Balance: ${balance} SEM`);
					data.push(`Spendable:     ${spendable} SEM`);
					data.push(`Locked:        ${locked} SEM\`\`\`\`\`\``);
					data.push(`Votes:    ${votes} SEM`);
					data.push(`Position: ${delegate.delegate_pos} of 10`);
					if (delegate.state === 'VALIDATOR') {
						data.push(`Status:   ${delegate.state}`);
						switch (delegate.alive_state) {
						case 'ALIVE': data.push(`Activity: ${delegate.alive_state}`); break;
						case 'WARNING': {
							if (delegate.missed_in_sequence_cnt != 0) {
								data.push(`Activity: ${delegate.alive_state} (missed ${delegate.missed_in_sequence_cnt} blocks)`);
							}
							else {
								data.push(`Activity: ${delegate.alive_state}`);
							}
							break;}
						case 'DEAD': data.push(`Activity: ${delegate.alive_state}!!!`); break;
						}
						data.push(`UpTime:   ${delegate.uptime_percent} %\`\`\``);
					}
					else {
						data.push(`Status:   ${delegate.state}\`\`\``);
					}
					break;
				}
			}
			if (!data.length) {
				data.push(`Delegate \`${args[0]}\` not found`);
			}


		}
		else {
			data.push(`You can send \`${prefix}delegate [name]\` to get info on a delegate/validator.`);
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