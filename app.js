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

document.addEventListener('DOMContentLoaded', function () {
	setupHamburgerToggle();
	setupCurrencyButtons();
	setupInputs();
	checkConnection();
	convert();
});

function setupHamburgerToggle() {
	let menu = document.querySelector('.hamburger-menu');
	let nav = document.querySelector('.nav-bar');

	menu.addEventListener('click', function () {
		if (nav.classList.contains('side-bar')) {
			nav.classList.remove('side-bar');
			nav.classList.add('nav');
		} else {
			nav.classList.remove('nav');
			nav.classList.add('side-bar');
		}
	});
}

function setupInputs() {
	let keyboardButton = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

	function restrictInput(e) {
		if (
			(e.key >= '0' && e.key <= '9') ||
			e.key === '.' ||
			e.key === ',' ||
			keyboardButton.indexOf(e.key) !== -1
		) {
		} else {
			e.preventDefault();
		}
	}

	amountInput.addEventListener('keydown', restrictInput);
	resultInput.addEventListener('keydown', restrictInput);

	amountInput.addEventListener('input', function () {
		formatAndCleanInput(amountInput);
		activeInput = 'amount';

		if (amountInput.value === '') {
			resultInput.value = '';
			showRates(0, 0);
		} else {
			if (isValidNumber(amountInput.value)) {
				convert();
			}
		}
	});

	resultInput.addEventListener('input', function () {
		formatAndCleanInput(resultInput);
		activeInput = 'result';

		if (resultInput.value === '') {
			amountInput.value = '';
			showRates(0, 0);
		} else {
			if (isValidNumber(resultInput.value)) {
				convert();
			}
		}
	});

	window.addEventListener('offline', function () {
		checkConnection(true);
	});
}

function formatAndCleanInput(input) {
	let val = input.value;

	val = val.replace(/,/g, '.');
	val = val.replace(/[^\d.]/g, '');

	let parts = val.split('.');
	if (parts.length > 2) {
		val = parts[0] + '.' + parts.slice(1).join('');
	}

	if (val.startsWith('.')) {
		val = '0' + val;
	}

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
	for (let i = 0; i < fromBtns.length; i++) {
		fromBtns[i].addEventListener('click', function () {
			for (let j = 0; j < fromBtns.length; j++) {
				fromBtns[j].classList.remove('from-focused');
			}
			fromBtns[i].classList.add('from-focused');
			fromValue = fromBtns[i].value;
			convert();
		});
	}

	let toBtns = document.querySelectorAll('.to');
	for (let i = 0; i < toBtns.length; i++) {
		toBtns[i].addEventListener('click', function () {
			for (let j = 0; j < toBtns.length; j++) {
				toBtns[j].classList.remove('to-focused');
			}
			toBtns[i].classList.add('to-focused');
			toValue = toBtns[i].value;
			convert();
		});
	}
}

function convert() {
	if (!navigator.onLine) {
		return;
	}

	if (fromValue === toValue) {
		let val;
		if (activeInput === 'amount') {
			val = amountInput.value;
		} else {
			val = resultInput.value;
		}
		amountInput.value = val;
		resultInput.value = val;
		showRates(1, 1);
		return;
	}

	if (activeInput === 'amount') {
		let amount = parseFloat(amountInput.value);
		if (isNaN(amount)) {
			amount = 0;
		}

		getRates(fromValue).then(function (data) {
			let rate = data.conversion_rates[toValue];
			let result = amount * rate;
			resultInput.value = result.toFixed(5).replace(/\.?0+$/, '');
			showRates(rate, 1 / rate);
		}).catch(function (err) {
			console.log('Məzənnə alınarkən xəta:', err);
			checkConnection(true);
		});
	} else {
		let result = parseFloat(resultInput.value);
		if (isNaN(result)) {
			result = 0;
		}

		getRates(toValue).then(function (data) {
			let reverseRate = data.conversion_rates[fromValue];
			let amount = result * reverseRate;
			amountInput.value = amount.toFixed(5).replace(/\.?0+$/, '');
			showRates(1 / reverseRate, reverseRate);
		}).catch(function (err) {
			console.log('Məzənnə alınarkən xəta:', err);
			checkConnection(true);
		});
	}
}


function getRates(base) {
	return fetch(url + '/' + apikey + '/latest/' + base).then(function (response) {
		if (!response.ok) {
			throw new Error('Xəta kodu: ' + response.status);
		}
		return response.json();
	});
}

function showRates(rate1, rate2) {
	if (rate1 === 0 || rate2 === 0) {
		currencyLabel.textContent = '';
		exchangeLabel.textContent = '';
	} else {
		currencyLabel.textContent = '1 ' + fromValue + ' = ' + rate1.toFixed(5) + ' ' + toValue;
		exchangeLabel.textContent = '1 ' + toValue + ' = ' + rate2.toFixed(5) + ' ' + fromValue;
	}
}

function checkConnection(force) {
	let offline;
	if (force === true || !navigator.onLine) {
		offline = true;
	} else {
		offline = false;
	}

	if (offline) {
		errorContainer.style.display = 'block';
	} else {
		errorContainer.style.display = 'none';
	}
}
