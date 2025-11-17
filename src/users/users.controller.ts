import { Body, Controller, Delete, Get , HttpStatus, Param, ParseFilePipeBuilder, ParseIntPipe, Patch, Post, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { TokenPayloadParam } from '../auth/param/token-payload.param';
import { PayloadTokenDto } from '../auth/dto/payload-token.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {        
        return this.userService.findOne(id);
    }

    @Post()
    create(@Body() CreateUserDto: CreateUserDto) {
        return this.userService.create(CreateUserDto);
    }

    @Get()
    findAllUsers() {
        return this.userService.findAllUsers();
    }

    @UseGuards(AuthTokenGuard)
    @Patch(':id')    
    updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @TokenPayloadParam() tokenPayload: PayloadTokenDto){
        console.log("Payload: ", tokenPayload);
        return this.userService.updateUser(id, updateUserDto, tokenPayload);
    }

    @UseGuards(AuthTokenGuard)
    @Delete(':id')
    removeUser(@Param('id', ParseIntPipe) id: number, @TokenPayloadParam() tokenPayload: PayloadTokenDto){
        return this.userService.removeUser(id, tokenPayload);
    }

    @UseGuards(AuthTokenGuard)
    @UseInterceptors(FileInterceptor('file'))
    @Post('upload')
    async uploadAvatar(@TokenPayloadParam() tokenPayload: PayloadTokenDto, 
    @UploadedFile(
        new ParseFilePipeBuilder().addFileTypeValidator({
            fileType: /jpeg|jpg|png/g,
        }).addMaxSizeValidator({
            maxSize: 3 * (1024 * 1024) //tamanho máximo de 3 MB
        }).build({
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        }),
    ) file: Express.Multer.File ){
        return this.userService.uploadAvatarImage(tokenPayload, file);
    }


    //Apenas para entendimento e estudo de como realizar o upload de muitas imagens
    @UseGuards(AuthTokenGuard)
    @UseInterceptors(FilesInterceptor('file'))
    @Post('uploadImages')
    async uploadAvatares(@TokenPayloadParam() tokenPayload: PayloadTokenDto, @UploadedFiles() files: Array<Express.Multer.File> ){
        files.forEach(async file => {
            const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
            const fileName = `${randomUUID()}.${fileExtension}`;
            const fileLocale = path.resolve(process.cwd(), 'files', fileName);

            await fs.writeFile(fileLocale, file.buffer);
        })

        return true;
    }
}