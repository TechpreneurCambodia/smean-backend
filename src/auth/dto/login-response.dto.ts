import { HttpStatus } from '@nestjs/common';

export class LoginResponseDto {
  message: string;
  access_token: string;
  refresh_token: string;
  statusCode: HttpStatus;

  constructor(message: string, access_token: string, refreshToken: string, statusCode: HttpStatus) {
    this.message = message;
    this.access_token = access_token;
    this.refresh_token = refreshToken;
    this.statusCode = statusCode;
  }
}
