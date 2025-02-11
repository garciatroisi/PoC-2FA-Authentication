import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should generate a QR code', async () => {
    const userId = 'testUser';
    const otpauthUrl = authService.generateSecret(userId);
    const qrCode = await authService.generateQRCode(otpauthUrl);

    expect(qrCode).toBeDefined();
  });

  it('should verify a valid TOTP token', () => {
    const userId = 'testUser';
    const otpauthUrl = authService.generateSecret(userId);
    const token = require('speakeasy').totp({
      secret: authService['users'].get(userId).secret,
      encoding: 'base32',
    });

    const isValid = authService.verifyToken(userId, token);
    expect(isValid).toBe(true);
  });

  it('should reject an invalid TOTP token', () => {
    const isValid = authService.verifyToken('testUser', '123456');
    expect(isValid).toBe(false);
  });
});
