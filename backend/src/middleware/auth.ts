import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (userId: string, walletAddress: string, email?: string): string => {
  return jwt.sign(
    { userId, walletAddress, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const generateSignMessage = (walletAddress: string): string => {
  const timestamp = Date.now();
  return `Sign this message to authenticate with QuiFlix: ${walletAddress} at ${timestamp}`;
};
