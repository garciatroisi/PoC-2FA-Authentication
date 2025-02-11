import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as speakeasy from 'speakeasy';
import jsQR from 'jsqr';
import { createCanvas, Image } from 'canvas';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userId = 'testUser';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should generate a QR code image', async () => {
    const response = await request(app.getHttpServer())
      .get(`/auth/generate/${userId}`)
      .responseType('blob')
      .expect(200);

    expect(Buffer.isBuffer(response.body)).toBe(true);
  });

  it('should verify a valid TOTP token', async () => {
    const response = await request(app.getHttpServer())
      .get(`/auth/generate/${userId}`)
      .responseType('blob')
      .expect(200);

    expect(Buffer.isBuffer(response.body)).toBe(true);

    const image = new Image();
    image.src = response.body;

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const otpauthUrl = jsQR(imageData.data, image.width, image.height)?.data;

    if (!otpauthUrl) {
      throw new Error('Failed to decode otpauthUrl from QR code.');
    }

    const secret = otpauthUrl.split('secret=')[1].split('&')[0];

    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
    });

    const verifyResponse = await request(app.getHttpServer())
      .post(`/auth/verify/${userId}?token=${token}`)
      .expect(200);

    expect(verifyResponse.body.isValid).toBe(true);
  });

  it('should reject an invalid TOTP token', async () => {
    const response = await request(app.getHttpServer())
      .post(`/auth/verify/${userId}?token=123456`)
      .expect(200);

    expect(response.body.isValid).toBe(false);
  });
});
