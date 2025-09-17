import { create, IPFSHTTPClient } from 'ipfs-http-client';
import fs from 'fs';
import path from 'path';

class IPFSService {
  private client: IPFSHTTPClient;
  private gatewayUrl: string;

  constructor() {
    this.client = create({
      url: process.env.IPFS_API_URL || 'http://localhost:5001'
    });
    this.gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/';
  }

  /**
   * Upload a file to IPFS
   * @param filePath Path to the file to upload
   * @param fileName Optional custom filename
   * @returns IPFS hash
   */
  async uploadFile(filePath: string, fileName?: string): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const file = {
        path: fileName || path.basename(filePath),
        content: fileBuffer
      };

      const result = await this.client.add(file);
      return result.cid.toString();
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  /**
   * Upload a buffer to IPFS
   * @param buffer File buffer
   * @param fileName Filename
   * @returns IPFS hash
   */
  async uploadBuffer(buffer: Buffer, fileName: string): Promise<string> {
    try {
      const file = {
        path: fileName,
        content: buffer
      };

      const result = await this.client.add(file);
      return result.cid.toString();
    } catch (error) {
      console.error('Error uploading buffer to IPFS:', error);
      throw new Error('Failed to upload buffer to IPFS');
    }
  }

  /**
   * Upload JSON metadata to IPFS
   * @param metadata JSON object to upload
   * @param fileName Optional filename
   * @returns IPFS hash
   */
  async uploadMetadata(metadata: any, fileName: string = 'metadata.json'): Promise<string> {
    try {
      const jsonString = JSON.stringify(metadata, null, 2);
      const buffer = Buffer.from(jsonString, 'utf8');
      
      return await this.uploadBuffer(buffer, fileName);
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      throw new Error('Failed to upload metadata to IPFS');
    }
  }

  /**
   * Get file from IPFS
   * @param hash IPFS hash
   * @returns File buffer
   */
  async getFile(hash: string): Promise<Buffer> {
    try {
      const chunks = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Error getting file from IPFS:', error);
      throw new Error('Failed to get file from IPFS');
    }
  }

  /**
   * Get metadata from IPFS
   * @param hash IPFS hash
   * @returns Parsed JSON object
   */
  async getMetadata(hash: string): Promise<any> {
    try {
      const buffer = await this.getFile(hash);
      const jsonString = buffer.toString('utf8');
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error getting metadata from IPFS:', error);
      throw new Error('Failed to get metadata from IPFS');
    }
  }

  /**
   * Get IPFS gateway URL for a hash
   * @param hash IPFS hash
   * @returns Gateway URL
   */
  getGatewayUrl(hash: string): string {
    return `${this.gatewayUrl}${hash}`;
  }

  /**
   * Pin a file to IPFS (ensure it stays available)
   * @param hash IPFS hash
   */
  async pinFile(hash: string): Promise<void> {
    try {
      await this.client.pin.add(hash);
    } catch (error) {
      console.error('Error pinning file to IPFS:', error);
      throw new Error('Failed to pin file to IPFS');
    }
  }

  /**
   * Unpin a file from IPFS
   * @param hash IPFS hash
   */
  async unpinFile(hash: string): Promise<void> {
    try {
      await this.client.pin.rm(hash);
    } catch (error) {
      console.error('Error unpinning file from IPFS:', error);
      throw new Error('Failed to unpin file from IPFS');
    }
  }

  /**
   * Check if IPFS node is available
   * @returns Boolean indicating if IPFS is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.client.version();
      return true;
    } catch (error) {
      console.error('IPFS node is not available:', error);
      return false;
    }
  }
}

export default new IPFSService();
