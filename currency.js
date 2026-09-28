const nairaFormatter = new Intl.NumberFormat('en-NG', {
	currency: 'NGN',
	currencyDisplay: 'narrowSymbol',
	maximumFractionDigits: 0,
	style: 'currency',
});

export function formatNaira(amount) {
	return nairaFormatter.format(amount);
}