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
    expect(otpauthUrl).toBeDefined();
  });

  it('should verify a valid TOTP token', () => {
    const userId = 'testUser';
    const token = '123456';
    const isValid = authService.verifyToken(userId, token);
    expect(isValid).toBeDefined();
  });
});
