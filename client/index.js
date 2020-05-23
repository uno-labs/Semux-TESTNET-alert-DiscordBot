const { ExtAPI } = require('../config/config-bot.json');
const rp = require('request-promise');

async function initialization() {

	const result = await semuxBlockchainDelegatesGet();
	if (result.error) {
		return;
	}
	for (const delegate of result.data) {
		global.DELEGATE_LIST.set(delegate.addr, delegate.name);
	}
}


async function semuxBlockchainAddressGet(account) {

	const options = {
		method: 'POST',
		uri: ExtAPI,
		body: { 'data' : [ account.slice(-40) ],
			'method' : 'semux.blockchain.address.get',
			'sid' : '00000000-0000-0000-0000-000000000000',
			'ts' : Date.now() }, // объект с данными для сервера
		headers:{ 'User-Agent': 'Request-Promise' },
		json: true,
	};

	let response = [];

	try {
		response = await rp(options);
		console.log(Date(), 'Get info for:', account, response.result.res);
		// console.log(accountInfo);
	}
	catch (e) {
		console.error(Date(), 'Failed to get account info', e.message);
		return { error: true };
	}

	if (!response.result || response.result.res != 'SUCCESS') {
		return { error: true, status: response.result.res };
	}

	return { success: true, status: response.result.res, data: response.data[0] };
}


async function semuxBlockchainTransactionsGetByBlockID(id) {

	const options = {
		method: 'POST',
		uri: ExtAPI,
		body: { 'data' : { 'block_id' : id, 'limit' : 2000, 'offset' : 0 },
			'method' : 'semux.blockchain.transactions.get_by_block_id',
			'sid' : '00000000-0000-0000-0000-000000000000',
			'ts' : Date.now() }, // объект с данными для сервера
		headers:{ 'User-Agent': 'Request-Promise' },
		json: true,
	};

	let response = [];

	try {
		response = await rp(options);
		console.log(Date(), 'Get info for:', id, response.result.res);
	}
	catch (e) {
		console.error(Date(), 'Failed to get account info', e.message);
		return { error: true };
	}

	if (!response.result || response.result.res != 'SUCCESS') {
		return { error: true, status: response.result.res };
	}

	return { success: true, status: response.result.res, data: response.data };
}


async function semuxBlockchainDelegatesGet() {

	const options = {
		method: 'POST',
		uri: ExtAPI,
		body: { 'data':[],
			'method':'semux.blockchain.delegates.get',
			'sid':'00000000-0000-0000-0000-000000000000',
			'ts':Date.now() }, // объект с данными для сервера
		headers:{ 'User-Agent': 'Request-Promise' },
		json: true,
	};

	let response = [];

	try {
		response = await rp(options);
		// console.log(Date(), 'Get list of delegates:', response.result.res);
	}
	catch (e) {
		console.error(Date(), 'Failed to get list of delegates', e.message);
		return { error: true };
	}

	if (!response.result || response.result.res != 'SUCCESS') {
		return { error: true, status: response.result.res };
	}

	return { success: true, status: response.result.res, data: response.data };
}


async function semuxBlockchainBlockGetLast() {

	const options = {
		method: 'POST',
		uri: ExtAPI,
		body: { 'data':[],
			'method':'semux.blockchain.block.get_last',
			'sid':'00000000-0000-0000-0000-000000000000',
			'ts':Date.now() }, // объект с данными для сервера
		headers:{ 'User-Agent': 'Request-Promise' },
		json: true,
	};

	let response = [];

	try {
		response = await rp(options);
		// console.log(Date(), 'Get latest block:', response.data.id, response.result.res);
	}
	catch (e) {
		console.error(Date(), 'Failed to get latest block', e.message);
		return { error: true };
	}

	if (!response.result || response.result.res != 'SUCCESS') {
		return { error: true, status: response.result.res };
	}

	return { success: true, status: response.result.res, data: response.data };
}


async function semuxBlockchainBlockGetByID(id) {

	const options = {
		method: 'POST',
		uri: ExtAPI,
		body: { 'data': id,
			'method':'semux.blockchain.block.get_by_id',
			'sid':'00000000-0000-0000-0000-000000000000',
			'ts':Date.now() }, // объект с данными для сервера
		headers:{ 'User-Agent': 'Request-Promise' },
		json: true,
	};

	let response = [];

	try {
		response = await rp(options);
		console.log(Date(), 'Get block by ID:', id, response.result.res);
	}
	catch (e) {
		console.error(Date(), 'Failed to get block by #', id, e.message);
		return { error: true };
	}

	if (!response.result || response.result.res != 'SUCCESS') {
		return { error: true, status: response.result.res };
	}

	return { success: true, status: response.result.res, data: response.data };
}


module.exports = {
	initialization, semuxBlockchainAddressGet, semuxBlockchainDelegatesGet, semuxBlockchainBlockGetLast,
	semuxBlockchainTransactionsGetByBlockID, semuxBlockchainBlockGetByID,
};