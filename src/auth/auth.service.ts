import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { Response } from 'express';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  private users = new Map<string, any>(); // DB Simulation

  generateSecret(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `SafeRocket (${userId})`,
    });
    this.users.set(userId, { secret: secret.base32 });
    return secret.otpauth_url;
  }

  async generateQRCode(otpauthUrl: string) {
    return await qrcode.toDataURL(otpauthUrl);
  }

  async respondWithQRCode(data: string, response: Response) {
    qrcode.toFileStream(response, data);
  }
  verifyToken(userId: string, token: string) {
    const user = this.users.get(userId);
    if (!user) return false;

    return speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'base32',
      token,
      window: 1, // Allow current and previous token
    });
  }
}
