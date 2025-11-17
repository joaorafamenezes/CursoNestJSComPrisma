import { Global, Module } from '@nestjs/common';
import { HashServiceProtocol } from './hash/hashing.service';
import { BcryptService } from './hash/bcrypt.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';

//Módulo global para serviços de autenticação e hashing
@Global()
@Module({
    imports:[
        PrismaModule,
        ConfigModule.forFeature(jwtConfig),
        JwtModule.registerAsync(jwtConfig.asProvider()),        
    ],
    providers: [
        {
            provide: HashServiceProtocol,
            useClass: BcryptService
        },
        AuthService
    ],
    exports: [HashServiceProtocol,
        JwtModule,
        ConfigModule
    ],
    controllers: [AuthController]
})
export class AuthModule {}
