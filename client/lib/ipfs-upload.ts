// lib/ipfs-upload.ts
// Upload directly to IPFS from frontend (no serverless function)

export async function uploadToIPFS(file: File): Promise<string> {
  try {
    // Option 1: Use Pinata (recommended)
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS')
    }

    const data = await response.json()
    return data.IpfsHash
  } catch (error) {
    console.error('IPFS upload error:', error)
    throw error
  }
}

// Alternative: Use Web3.Storage
export async function uploadToWeb3Storage(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload to Web3.Storage')
    }

    const data = await response.json()
    return data.cid
  } catch (error) {
    console.error('Web3.Storage upload error:', error)
    throw error
  }
}

// For thumbnail images - can use Vercel if small
export async function uploadThumbnail(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/thumbnail', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Thumbnail upload failed')
  }

  const data = await response.json()
  return data.url
}
