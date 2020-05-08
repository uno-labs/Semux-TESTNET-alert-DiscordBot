'use strict';

const { hexToString } = require('./utils.js');

const { getDelegatesList, semuxBlockchainDelegatesGet, semuxBlockchainBlockGetLast,
	semuxBlockchainTransactionsGetByBlockID } = require('./client/extAPIscan.js');

// const PUBLIC_POOLS = require('./config/public-pools.json'); // Список аккаунтов публичных пулов
const ALIVE_LIST = new Map();

let LAST_HEIGHT = 0;
let OLD_HEIGHT = 0;
let BIG_BLOCK = 50;
let BLOCKCHAIN_STOPPED = false;


// Сканирование по списку делегатов/валидаторов (раз в 10 минут)
async function scanDelegatesList() {

	const alerts = [];

	if (OLD_HEIGHT > LAST_HEIGHT) {
		return { error: true };
	}

	if (OLD_HEIGHT === LAST_HEIGHT && BLOCKCHAIN_STOPPED) {
		console.log(Date(), 'testnet_stopped');
		alerts.push({ date: Date(), type: 'testnet_stopped' });
		OLD_HEIGHT = LAST_HEIGHT + 1;
		BLOCKCHAIN_STOPPED = true;
	}
	else {
		OLD_HEIGHT = LAST_HEIGHT;
		BLOCKCHAIN_STOPPED = false;
		const result = await semuxBlockchainDelegatesGet();
		if (result.error) {
			return { error: true };
		}

		// Сканируем валидаторов, заносим живых в список и следим только за ними.
		// Если валидатор пропустил блок, то посылаем алерт и удаляем его из списка
		// Если валидатор стал делегатом, то удаляем его из списка
		for (const delegate of result.data) {
			if (!ALIVE_LIST.get(delegate.addr)) {
				if (delegate.alive_state === 'ALIVE') {
					ALIVE_LIST.set(delegate.addr, 'ALIVE');
				}
			}
			else {
				if (delegate.alive_state === 'WARNING') {
				// [!ALERT!] Валидатор пропустил блок!
					alerts.push({ validator: getDelegatesList().get(delegate.addr), type: 'missed_block' });
					ALIVE_LIST.delete(delegate.addr);
				}
				if (delegate.alive_state === 'NOT_SET') {
					ALIVE_LIST.delete(delegate.addr);
				}
			}
		}
	}
	return { success: true, alerts: alerts };
}

// Сканируем каждый новый блок (ищем новую высоту блока каждые 10 сек)
async function scanNewBlock() {

	const lastHeigh = await semuxBlockchainBlockGetLast();
	if (lastHeigh.error) {
		return { error: true };
	}
	if (lastHeigh.data.id === LAST_HEIGHT) {
		return { error: true };
	}
	LAST_HEIGHT = lastHeigh.data.id;

	// Если в блоке только одна COINBASE транзакция, то пропускаем
	if (lastHeigh.data.transactions_count < 2) {
		return { error: true };
	}

	const alerts = [];

	// [!ALERT!] в блоке много транзакций! При срабатывании, увеличиваем порог в 2 раза
	if (lastHeigh.data.transactions_count > BIG_BLOCK) {
		alerts.push({ block: LAST_HEIGHT, count: lastHeigh.data.transactions_count, type: 'big_block' });
		BIG_BLOCK = BIG_BLOCK * 2;
	}

	// Если в блоке есть еще транзакции, то сканируем транзакции
	const block = await semuxBlockchainTransactionsGetByBlockID(LAST_HEIGHT);
	if (!block.data) {
		return { error: true };
	}

	// Пишем в лог номера блоков с транзакциями
	console.log(LAST_HEIGHT, lastHeigh.data.transactions_count);

	for (const tx of block.data) {
		switch (tx.type) {
		// [!ALERT!] Зарегистрирован новый делегат!
		case 'DELEGATE':
			alerts.push({ name: hexToString(tx.data), type: 'delegate' });
			break;
		}
	}
	return { success: true, alerts: alerts };
}

module.exports = {
	scanDelegatesList, scanNewBlock,
};