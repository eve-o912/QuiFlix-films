declare class IPFSService {
    private client;
    private gatewayUrl;
    constructor();
    uploadFile(filePath: string, fileName?: string): Promise<string>;
    uploadBuffer(buffer: Buffer, fileName: string): Promise<string>;
    uploadMetadata(metadata: any, fileName?: string): Promise<string>;
    getFile(hash: string): Promise<Buffer>;
    getMetadata(hash: string): Promise<any>;
    getGatewayUrl(hash: string): string;
    pinFile(hash: string): Promise<void>;
    unpinFile(hash: string): Promise<void>;
    isAvailable(): Promise<boolean>;
}
declare const _default: IPFSService;
export default _default;
//# sourceMappingURL=ipfsService.d.ts.map