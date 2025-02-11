import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('generate/:userId')
  @ApiOperation({ summary: 'Generate a secret key and QR code for the user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'QR code generated successfully',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'The ID of the user for whom the QR code is generated',
  })
  async generate(@Param('userId') userId: string, @Res() res: Response) {
    const otpauthUrl = this.authService.generateSecret(userId);
    return this.authService.respondWithQRCode(otpauthUrl, res);
  }

  @Post('verify/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify the token for the user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Token is valid' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Token is invalid',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'The ID of the user whose token is being verified',
  })
  @ApiQuery({
    name: 'token',
    type: String,
    description: 'The token to verify',
  })
  verify(@Param('userId') userId: string, @Query('token') token: string) {
    const isValid = this.authService.verifyToken(userId, token);
    return { isValid };
  }
}
