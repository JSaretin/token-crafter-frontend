import { ethers } from 'ethers';

export function convertNumberToBigInt(num: number, decimals: number = 18) {
    return ethers.parseUnits(num.toString(), decimals);
}

export function formatTax(tax: number) {
    return (tax * 10)
}

export function convertFromBitIntToNumber(num: ethers.BigNumberish, decimals: number) {
    return ethers.formatUnits(num, decimals)
}