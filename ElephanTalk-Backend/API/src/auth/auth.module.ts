import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import appConfig from 'src/config/app.config';
import { ConfigType } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalAdminStrategy } from './strategies/local-admin.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [appConfig.KEY],
      useFactory: (configService: ConfigType<typeof appConfig>) => ({
        secret: configService.jwt.secret,
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, LocalAdminStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
