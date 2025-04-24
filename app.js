let amountInput = document.querySelector('.amount');
let resultInput = document.querySelector('.result');
let currencyLabel = document.querySelector('.currency-label');
let exchangeLabel = document.querySelector('.exchange-label');
let header = document.querySelector('.header');
let main = document.querySelector('.main1');
let errorContainer = document.querySelector('.error-status');

let fromValue = 'RUB';
let toValue = 'USD';
let activeInput = 'amount';

let apikey = '6c56568c38f367c072e3592e';
let url = 'https://v6.exchangerate-api.com/v6';

document.addEventListener('DOMContentLoaded', () => {
	setupHamburgerToggle();
	setupCurrencyButtons();
	setupInputs();
	checkConnection();
	convert();
});

function setupHamburgerToggle() {
	let menu = document.querySelector('.hamburger-menu');
	let nav = document.querySelector('.nav-bar');

	menu.addEventListener('click', () => {
		nav.classList.toggle('side-bar');
		nav.classList.toggle('nav');
	});
}

function setupInputs() {
	const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

	function restrictInput(e) {
		if (
			(e.key >= '0' && e.key <= '9') ||
			e.key === '.' ||
			allowedKeys.includes(e.key)
		) {
			return;
		} else {
			e.preventDefault();
		}
	}

	amountInput.addEventListener('keydown', restrictInput);
	resultInput.addEventListener('keydown', restrictInput);

	amountInput.addEventListener('input', () => {
		cleanInput(amountInput);
		activeInput = 'amount';

		if (amountInput.value === '') {
			resultInput.value = '';
			showRates(0, 0);
			return;
		}

		if (isValidNumber(amountInput.value)) {
			convert();
		}
	});

	resultInput.addEventListener('input', () => {
		cleanInput(resultInput);
		activeInput = 'result';

		if (resultInput.value === '') {
			amountInput.value = '';
			showRates(0, 0);
			return;
		}

		if (isValidNumber(resultInput.value)) {
			convert();
		}
	});

	window.addEventListener('offline', () => checkConnection(true));
}

function cleanInput(input) {
	let val = input.value;

	val = val.replace(/,/g, '.');

	let parts = val.split('.');
	if (parts.length > 2) {
		val = parts[0] + '.' + parts.slice(1).join('');
	}

	if (val.startsWith('.')) {
		val = '0' + val;
	}

	val = val.replace(/[^\d.]/g, '');

	input.value = val;
}

function isValidNumber(val) {
	if (val === '' || val === '.' || val === '0.' || val.endsWith('.')) {
		return false;
	}
	return !isNaN(parseFloat(val));
}

function setupCurrencyButtons() {
	let fromBtns = document.querySelectorAll('.from');
	fromBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			fromBtns.forEach(b => b.classList.remove('from-focused'));
			btn.classList.add('from-focused');
			fromValue = btn.value;
			convert();
		});
	});

	let toBtns = document.querySelectorAll('.to');
	toBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			toBtns.forEach(b => b.classList.remove('to-focused'));
			btn.classList.add('to-focused');
			toValue = btn.value;
			convert();
		});
	});
}

async function convert() {
	if (!navigator.onLine) return;

	if (fromValue === toValue) {
		let val = activeInput === 'amount' ? amountInput.value : resultInput.value;
		amountInput.value = val;
		resultInput.value = val;
		showRates(1, 1);
		return;
	}

	try {
		if (activeInput === 'amount') {
			let amount = parseFloat(amountInput.value);
			if (isNaN(amount)) amount = 0;

			let data = await getRates(fromValue);
			let rate = data.conversion_rates[toValue];
			let result = amount * rate;

			resultInput.value = result.toFixed(5);
			showRates(rate, 1 / rate);
		} else {
			let result = parseFloat(resultInput.value);
			if (isNaN(result)) result = 0;

			let data = await getRates(toValue);
			let reverseRate = data.conversion_rates[fromValue];
			let amount = result * reverseRate;

			amountInput.value = amount.toFixed(5);
			showRates(1 / reverseRate, reverseRate);
		}
	} catch (err) {
		console.error('Məzənnə alınarkən xəta:', err);
		checkConnection(true);
	}
}

async function getRates(base) {
	let response = await fetch(`${url}/${apikey}/latest/${base}`);
	if (!response.ok) {
		throw new Error(`Xəta kodu: ${response.status}`);
	}
	return await response.json();
}

function showRates(rate1, rate2) {
	if (rate1 === 0 || rate2 === 0) {
		currencyLabel.textContent = '';
		exchangeLabel.textContent = '';
		return;
	}
	currencyLabel.textContent = `1 ${fromValue} = ${rate1.toFixed(5)} ${toValue}`;
	exchangeLabel.textContent = `1 ${toValue} = ${rate2.toFixed(5)} ${fromValue}`;
}

function checkConnection(force = false) {
	let offline = force || !navigator.onLine;
	errorContainer.style.display = offline ? 'block' : 'none';
}
