"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ipfs_http_client_1 = require("ipfs-http-client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class IPFSService {
    constructor() {
        const apiUrl = process.env.IPFS_API_URL || 'http://localhost:5001';
        const apiKey = process.env.IPFS_API_KEY;
        const apiSecret = process.env.IPFS_API_SECRET;
        if (apiKey && apiSecret) {
            this.client = (0, ipfs_http_client_1.create)({
                url: apiUrl,
                headers: {
                    authorization: 'Basic ' + Buffer.from(apiKey + ':' + apiSecret).toString('base64')
                }
            });
        }
        else if (apiKey) {
            const urlWithKey = apiUrl.includes('?') ? `${apiUrl}&key=${apiKey}` : `${apiUrl}?key=${apiKey}`;
            this.client = (0, ipfs_http_client_1.create)({ url: urlWithKey });
        }
        else {
            this.client = (0, ipfs_http_client_1.create)({ url: apiUrl });
        }
        this.gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/';
    }
    async uploadFile(filePath, fileName) {
        try {
            const fileBuffer = fs_1.default.readFileSync(filePath);
            const file = {
                path: fileName || path_1.default.basename(filePath),
                content: fileBuffer
            };
            const result = await this.client.add(file);
            return result.cid.toString();
        }
        catch (error) {
            console.error('Error uploading file to IPFS:', error);
            throw new Error('Failed to upload file to IPFS');
        }
    }
    async uploadBuffer(buffer, fileName) {
        try {
            const file = {
                path: fileName,
                content: buffer
            };
            const result = await this.client.add(file);
            return result.cid.toString();
        }
        catch (error) {
            console.error('Error uploading buffer to IPFS:', error);
            throw new Error('Failed to upload buffer to IPFS');
        }
    }
    async uploadMetadata(metadata, fileName = 'metadata.json') {
        try {
            const jsonString = JSON.stringify(metadata, null, 2);
            const buffer = Buffer.from(jsonString, 'utf8');
            return await this.uploadBuffer(buffer, fileName);
        }
        catch (error) {
            console.error('Error uploading metadata to IPFS:', error);
            throw new Error('Failed to upload metadata to IPFS');
        }
    }
    async getFile(hash) {
        try {
            const chunks = [];
            for await (const chunk of this.client.cat(hash)) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        }
        catch (error) {
            console.error('Error getting file from IPFS:', error);
            throw new Error('Failed to get file from IPFS');
        }
    }
    async getMetadata(hash) {
        try {
            const buffer = await this.getFile(hash);
            const jsonString = buffer.toString('utf8');
            return JSON.parse(jsonString);
        }
        catch (error) {
            console.error('Error getting metadata from IPFS:', error);
            throw new Error('Failed to get metadata from IPFS');
        }
    }
    getGatewayUrl(hash) {
        return `${this.gatewayUrl}${hash}`;
    }
    async pinFile(hash) {
        try {
            await this.client.pin.add(hash);
        }
        catch (error) {
            console.error('Error pinning file to IPFS:', error);
            throw new Error('Failed to pin file to IPFS');
        }
    }
    async unpinFile(hash) {
        try {
            await this.client.pin.rm(hash);
        }
        catch (error) {
            console.error('Error unpinning file from IPFS:', error);
            throw new Error('Failed to unpin file from IPFS');
        }
    }
    async isAvailable() {
        try {
            await this.client.version();
            return true;
        }
        catch (error) {
            console.error('IPFS node is not available:', error);
            return false;
        }
    }
}
exports.default = new IPFSService();
//# sourceMappingURL=ipfsService.js.map