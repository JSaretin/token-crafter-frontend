import { Contract, ethers } from 'ethers';
import { OmegaTokenABI } from './interfaces';
import { formatTax } from './utils';

function convertToNumber(value: bigint) {
    return ethers.toNumber(value)
}

function formatTaxForDisplay(value: bigint) {
    return convertToNumber(value) / 10
}


export class OmegaToken {
    contract: Contract
    constructor(contractAddr: string, provider: ethers.Signer) {
        this.contract = new Contract(contractAddr, OmegaTokenABI, provider);
    }

    async mintEnabled(): Promise<boolean> { return await this.contract.mintEnabled(); }
    async burnEnabled(): Promise<boolean> { return await this.contract.burnEnabled(); }
    async convertTaxToCoin(): Promise<boolean> { return await this.contract.convertTaxToCoin(); }
    async isPartner(): Promise<boolean> { return await this.contract.isPartner(); }
    async BUY_TAX(): Promise<number> { return formatTaxForDisplay(await this.contract.BUY_TAX()); }
    async SELL_TAX(): Promise<number> { return formatTaxForDisplay(await this.contract.SELL_TAX()); }
    async TRANSFER_TAX(): Promise<number> { return formatTaxForDisplay(await this.contract.TRANSFER_TAX()); }
    async LIQUIDITY_POOL(): Promise<string> { return await this.contract.LIQUIDITY_POOL(); }
    async owner(): Promise<string> { return await this.contract.owner() }
    async taxWallet(): Promise<string> { return await this.contract.taxWallet() }
    async decimals(): Promise<number> { return ethers.toNumber(await this.contract.decimals()) }

    async getPrice(ethValue: number): Promise<number> {
        return await this.contract.getPrice(ethValue);
    }

    async getETHValue(tokenValue: number): Promise<number> {
        return await this.contract.getETHValue(tokenValue);
    }

    async mint(receiver: string, amount: number) {
        const tx = await this.contract.mint(receiver, amount);
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation 
    }

    async burn(amount: number) {
        const tokenAmount = ethers.parseEther(amount.toString());
        const tx = await this.contract.burn(tokenAmount);
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation 
    }

    async setPayTax(addr: string, shouldPayTax: boolean) {
        const tx = await this.contract.setPayTax(addr, shouldPayTax);
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation 
    }

    async setTax(buyTax: number, sellTax: number, transferTax: number, convertTaxToCoin: boolean) {
        // TODO: multiple tax buy 100 before passing to the smart contract
        const tx = await this.contract.setTax(
            formatTax(buyTax),
            formatTax(sellTax),
            formatTax(transferTax),
            convertTaxToCoin);
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation 
    }

    async updateSettings(canMint: boolean, canBurn: boolean) {
        // TODO: multiple tax buy 100 before passing to the smart contract
        const tx = await this.contract.updateSettings(canMint, canBurn);
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation 
    }

    async increaseLiquidity(etherValue: number, amount: number, amountTokenMin: number, amountETHMin: number) {
        // TODO: multiple tax buy 100 before passing to the smart contract
        const tokenAmount = ethers.parseEther(amount.toString());
        const tx = await this.contract.increaseLiquidity(tokenAmount, amountTokenMin, amountETHMin, {value: ethers.parseEther(etherValue.toString())});
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation 
    }

    async withdrawEth(receiver: string) {
        const tx = await this.contract.withdrawEth(receiver);
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation 
    }

    async withdrawToken(tokenAddress: string) {
        const tx = await this.contract.withdrawToken(tokenAddress);
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation 
    }

}