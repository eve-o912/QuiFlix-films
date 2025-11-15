interface ContractAddresses {
    nftContract: string;
    contentContract: string;
}
interface FilmMetadata {
    title: string;
    description: string;
    genre: string;
    duration: number;
    releaseDate: number;
    producer: string;
    ipfsHash: string;
    price: string;
    isActive: boolean;
}
interface ContentMetadata {
    contentId: number;
    title: string;
    ipfsHash: string;
    producer: string;
    totalRevenue: string;
    totalViews: number;
    isActive: boolean;
    createdAt: number;
}
declare class BlockchainService {
    private provider;
    private wallet;
    private nftContract;
    private contentContract;
    constructor();
    private validateEnvironmentVariables;
    private getShortAddress;
    createFilm(title: string, description: string, genre: string, duration: number, releaseDate: number, ipfsHash: string, price: string, tokenURI: string): Promise<{
        tokenId: number;
        txHash: string;
    }>;
    approveFilm(tokenId: number): Promise<string>;
    purchaseFilm(tokenId: number, price: string): Promise<string>;
    transferWithRoyalty(tokenId: number, to: string, price: string): Promise<string>;
    getFilmMetadata(tokenId: number): Promise<FilmMetadata>;
    getNFTOwner(tokenId: number): Promise<string>;
    getRoyaltyInfo(tokenId: number, salePrice: string): Promise<{
        recipient: string;
        amount: string;
    }>;
    createContent(title: string, ipfsHash: string): Promise<{
        contentId: number;
        txHash: string;
    }>;
    recordView(contentId: number): Promise<string>;
    distributeRevenue(contentId: number, amount: string): Promise<string>;
    getContent(contentId: number): Promise<ContentMetadata>;
    verifySignature(message: string, signature: string, address: string): Promise<boolean>;
    getWalletAddress(): string;
    getContractAddresses(): ContractAddresses;
    getWalletBalance(): Promise<string>;
    hasEnoughBalance(address: string, requiredAmount: string): Promise<boolean>;
    getGasPrice(): Promise<string>;
    healthCheck(): Promise<{
        status: string;
        blockNumber: number;
        network: string;
    }>;
}
declare const _default: BlockchainService;
export default _default;
//# sourceMappingURL=blockchainService.d.ts.map