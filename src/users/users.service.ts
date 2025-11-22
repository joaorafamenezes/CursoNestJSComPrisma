import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashServiceProtocol } from '../auth/hash/hashing.service';
import { PayloadTokenDto } from '../auth/dto/payload-token.dto';
import path from 'node:path';
import * as fs from 'node:fs/promises';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private readonly hashService: HashServiceProtocol
    ) {}

    async findOne(id: number) {
        const user = await this.prisma.user.findFirst({
            where: { id },
            select: {
                id: true,
                name: true, 
                email: true,
                Task: true,
                avatar: true
            }
        });

        if(!user) {
            throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
        }

        return user;
    }

    async create(createUserDto: CreateUserDto) {
        try {
            const passwordHash = await this.hashService.hash(createUserDto.passwordHash);

            const newUser = await this.prisma.user.create({
            data: {
                name: createUserDto.name,
                passwordHash: passwordHash,
                email: createUserDto.email,
                createdAt: new Date(),
                }, 
                select: {
                    id: true,
                    name: true, 
                    email: true,
                }
            });

            return newUser;
        } catch (error) {
            console.error(error);
            throw new HttpException('Message: ' + error, HttpStatus.BAD_REQUEST);
        }        
    }
    
    async findAllUsers(){
        try {
            const users = await this.prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            });
            
            return users;
        } catch (error) {
            throw new HttpException('Message: ' + error, HttpStatus.BAD_REQUEST);
        }
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto, payload: PayloadTokenDto) {
        try {

            const user = await this.prisma.user.findUnique({
                where: { id },
            });

            if(!user) {
                throw new HttpException('Usuário não localizado', HttpStatus.NOT_FOUND);
            }            

            if(user.id !== payload.sub) {
                throw new HttpException('Ação não permitida', HttpStatus.FORBIDDEN);
            }

            const updateUser = await this.prisma.user.update({
                where: { id },
                data: {
                    name: updateUserDto.name,
                    email: updateUserDto.email,
                    passwordHash: updateUserDto.passwordHash ? await this.hashService.hash(updateUserDto.passwordHash) : user.passwordHash,
                    avatar: updateUserDto.avatar,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                }
            });

            return updateUser;
        } catch (error) {
          throw new HttpException('Message: ' + error, HttpStatus.BAD_REQUEST);   
        }
    }

    async removeUser(id: number, tokenPayload: PayloadTokenDto) {
        try {

            const user = await this.prisma.user.findUnique({
                where: { id },
            });

            if(!user){
                throw new HttpException('Usuário não localizado', HttpStatus.NOT_FOUND);
            }

            if(id !== tokenPayload.sub) {
                throw new HttpException('Ação não permitida', HttpStatus.FORBIDDEN);
            }

            await this.prisma.user.delete({
                where: { id },
            });

            return { message: 'Usuário deletado com sucesso.' };
        } catch (error) {
            throw new HttpException('Message: ' + error, HttpStatus.BAD_REQUEST);   
        }    
    }

    async uploadAvatarImage(tokenPayload: PayloadTokenDto, file: Express.Multer.File){      
        try {
            const mimeType = file.mimetype;
            const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
            const fileName = `${tokenPayload.sub}.${fileExtension}`
            const fileLocale = path.resolve(process.cwd(), 'files', fileName);

            await fs.writeFile(fileLocale, file.buffer);

            const user = await this.findOne(tokenPayload.sub);

            if(!user){
                throw new HttpException('Falha ao localizar o usuário!', HttpStatus.BAD_REQUEST);    
            }

            const updateUserDTO: UpdateUserDto = { 
                avatar: fileName,
                name: user.name,
                email: user.email
            }

            const updateUser = await this.updateUser(user.id, updateUserDTO, tokenPayload);

            return updateUser;            
        } catch (error) {
            console.error(error);
            throw new HttpException('Falha ao atualizar avatar do usuário!', HttpStatus.BAD_REQUEST);
        }
    }
}
