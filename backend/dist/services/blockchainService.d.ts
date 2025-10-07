interface ContractAddresses {
    nftContract: string;
    contentContract: string;
}
declare class BlockchainService {
    private provider;
    private wallet;
    private nftContract;
    private contentContract;
    constructor();
    createFilm(title: string, description: string, genre: string, duration: number, releaseDate: number, ipfsHash: string, price: string, tokenURI: string): Promise<{
        tokenId: number;
        txHash: string;
    }>;
    approveFilm(tokenId: number): Promise<string>;
    purchaseFilm(tokenId: number, price: string): Promise<string>;
    transferWithRoyalty(tokenId: number, to: string, price: string): Promise<string>;
    getFilmMetadata(tokenId: number): Promise<any>;
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
    getContent(contentId: number): Promise<any>;
    verifySignature(message: string, signature: string, address: string): Promise<boolean>;
    getWalletAddress(): string;
    getContractAddresses(): ContractAddresses;
}
declare const _default: BlockchainService;
export default _default;
//# sourceMappingURL=blockchainService.d.ts.map