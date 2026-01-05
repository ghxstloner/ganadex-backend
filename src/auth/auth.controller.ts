import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { getUserIdFromRequest } from '../common/utils/get-user-id';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmpresaActivaDto } from './dto/empresa-activa.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  async getSession(@Req() request: Request) {
    const userId = getUserIdFromRequest(request);
    return this.authService.getSession(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('empresa-activa')
  async setEmpresaActiva(
    @Req() request: Request,
    @Body() dto: EmpresaActivaDto,
  ) {
    const userId = getUserIdFromRequest(request);
    return this.authService.setActiveEmpresa(userId, dto.empresa_id);
  }
}
