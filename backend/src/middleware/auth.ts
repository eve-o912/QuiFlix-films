import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (userId: string, walletAddress: string): string => {
  return jwt.sign(
    { userId, walletAddress },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const generateSignMessage = (walletAddress: string): string => {
  const timestamp = Date.now();
  return `Sign this message to authenticate with QuiFlix: ${walletAddress} at ${timestamp}`;
};
