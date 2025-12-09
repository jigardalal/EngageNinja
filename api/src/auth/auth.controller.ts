import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SkipActiveTenantCheck } from './decorators/skip-active-tenant.decorator';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { SwitchTenantDto } from './dto/switch-tenant.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthContext } from './auth.types';
import { setAuthCookies } from './auth.cookie';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() dto: SignupDto,
    @Ip() ipAddress: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(dto, ipAddress);
    setAuthCookies(res, result.tokens, result.tenant.id);
    return result;
  }

  @Post('login')
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Ip() ipAddress: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, ipAddress);
    setAuthCookies(res, result.tokens, result.tenant.id);
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: AuthContext) {
    return { user };
  }

  @Post('switch-tenant')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @SkipActiveTenantCheck()
  async switchTenant(
    @Body() dto: SwitchTenantDto,
    @CurrentUser() user: AuthContext,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.switchTenant(user, dto.tenantId);
    setAuthCookies(res, result.tokens, result.tenant.id);
    return result;
  }
}
