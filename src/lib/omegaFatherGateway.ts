import { Contract, ethers } from 'ethers';
import { OmegaFatherABI } from './interfaces';
import { formatTax, convertNumberToBigInt, convertFromBitIntToNumber } from "./utils";


interface ContractInfo {
    addr: string;
    name: string;
    symbol: string;
    decimals: number;
    isPartner: boolean;
    isOmegaToken: boolean;
    totalSupply: number;
}

export class OmegaFather {
    contract: Contract
    constructor(contractAddr: string, provider: ethers.Signer | ethers.Provider) {
        this.contract = new Contract(contractAddr, OmegaFatherABI, provider);
    }

    async isOmegaCreated(contractAddr: string): Promise<[boolean, boolean]> {
        return await this.contract.isOmegaCreated(contractAddr);
    }

    async getCreationFee(): Promise<[number, number]> {
        return await this.contract.getCreationFee()
    }

    async getStats(): Promise<[number, number]> {
        return await this.contract.getStats()
    }

    async getContractAddressAtIndex(index: number): Promise<string> {
        return await this.contract.getContractAddressAtIndex(index);
    }

    async getPartnerContractAddressAtIndex(index: number): Promise<string> {
        return await this.contract.getPartnerContractAddressAtIndex(index)
    }

    async getContractDetails(contractAddr: string): Promise<ContractInfo> {
        return await this.contract.getContractDetails(contractAddr)
    }

    async getContractAtIndex(index: number): Promise<ContractInfo> {
        return await this.contract.getContractAtIndex(index);
    }

    async getPartnerContractAtIndex(index: number): Promise<ContractInfo> {
        return await this.contract.getPartnerContractAtIndex(index);
    }

    async getCreatorTotalContractsCounts(creator: string): Promise<number> {
        return await this.contract.getCreatorTotalContractsCounts(creator);
    }

    async getCreatorContractsAddresses(creator: string, fromIndex: number, toIndex: number): Promise<string[]> {
        return await this.contract.getCreatorContractsAddresses(creator, fromIndex, toIndex);
    }

    async getCreatorContractsDetail(creator: string, fromIndex: number, toIndex: number): Promise<ContractInfo[]> {
        return await this.contract.getCreatorContractsDetail(creator, fromIndex, toIndex);
    }

    async updateCreationFee(creationFee_: number, partnershipPercentOff: number) {
        const tx = await this.contract.updateCreationFee(creationFee_, partnershipPercentOff);
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation
    }


    async createToken(taxWallet: string, decimals: number, buyTax: number, sellTax: number, transferTax: number,
        totalSupply: number, name: string, symbol: string, isPartner: boolean): Promise<any> {
        const fees = await this.getCreationFee();
        let fee: number;
        if (isPartner) fee = fees[1]
        else fee = fees[0]

        const options = {
            value: fee
        }

        const tx = await this.contract.createToken(
            Boolean(taxWallet) ? taxWallet : ethers.ZeroAddress,
            decimals,
            formatTax(buyTax),
            formatTax(sellTax),
            formatTax(transferTax),
            totalSupply,
            name,
            symbol,
            isPartner, options);
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation
        return sentTransaction;
    }

    async withdrawCoin(receiver: string, amount: number) {
        const tx = await this.contract.withdrawCoin(receiver, amount);
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation
    }

    async withrawAllCoin(receiver: string) {
        const tx = await this.contract.withrawAllCoin(receiver);
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation
    }

    async withdrawToken(tokenAddress: string, receiver: string, amount: number) {
        const tx = await this.contract.withdrawToken(tokenAddress, receiver, amount);
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation
    }
    async withdrawAllToken(tokenAddress: string, receiver: string) {
        const tx = await this.contract.withdrawAllToken(tokenAddress, receiver);
        // call a function before confirmation
        const sentTransaction = await tx.wait();
        // call a function after confirmation
    }
}
