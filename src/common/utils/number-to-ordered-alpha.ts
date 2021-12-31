export const numberToOrderedAlpha = (number: number) => {
	const first = Math.ceil(number / 676);
	const second = (Math.ceil(number / 26) % 26) ?? 26;
	const third = Math.ceil(number % 26) ?? 26;

	return String.fromCharCode(96 + first)
        + String.fromCharCode(96 + second)
        + String.fromCharCode(96 + third);
};
