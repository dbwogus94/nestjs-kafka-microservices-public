import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CookieConfig } from 'src/config/schema.config';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { errorMessage, responseMessage } from './response-message';
import { User } from './user/user.entity';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('/auth')
@ApiTags('SCM 인증 API')
@ApiBadRequestResponse({ description: errorMessage.badRequest })
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  private setCookie(res: Response, val: string) {
    const { accessCookie } = this.configService.get<CookieConfig>('cookie');
    const { key, options } = accessCookie;
    res.cookie(key, val, options);
  }

  private crearCookie(res: Response) {
    const { accessCookie } = this.configService.get<CookieConfig>('cookie');
    const { key } = accessCookie;
    res.clearCookie(key);
  }

  @Post('/signup')
  @HttpCode(204)
  @ApiOperation({ summary: '회원 가입' })
  @ApiNoContentResponse({ description: responseMessage.signup })
  @ApiConflictResponse({ description: errorMessage.conflict })
  async signup(@Body() signupDto: SignupDto) {
    await this.authService.signup(signupDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  @HttpCode(201)
  @ApiOperation({ summary: '로그인' })
  @ApiCreatedResponse({ description: responseMessage.signin })
  @ApiUnauthorizedResponse({ description: errorMessage.unauthorized_signin })
  async signin(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() signinDto: SigninDto,
  ): Promise<any> {
    const { id, accessToken } = await this.authService.signin(req.user);
    this.setCookie(res, `${accessToken} ${id}`);
    return { id };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @ApiCookieAuth()
  @ApiOperation({ summary: '토큰 확인' })
  @ApiOkResponse({ description: responseMessage.me })
  @ApiUnauthorizedResponse({ description: errorMessage.unauthorized })
  me(@Req() req: Response & { user: User }): object {
    const { id } = req.user;
    return { id };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/logout')
  @HttpCode(204)
  @ApiCookieAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiNoContentResponse({ description: responseMessage.logout })
  @ApiUnauthorizedResponse({ description: errorMessage.unauthorized })
  async logout(
    @Req() req: Response & { user: User },
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { id } = req.user;
    await this.authService.logout(id);
    this.crearCookie(res);
  }
}
