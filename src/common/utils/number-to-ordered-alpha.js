export const numberToOrderedAlpha = (num) => {
    const first = Math.ceil(num / 676);
    const second = (Math.ceil(num / 26) % 26) ?? 26;
    const third = Math.ceil(num % 26) ?? 26;

    return String.fromCharCode(96 + first) +
        String.fromCharCode(96 + second) +
        String.fromCharCode(96 + third)
};
