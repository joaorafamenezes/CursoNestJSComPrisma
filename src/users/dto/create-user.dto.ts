import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto{
    @IsString({ message: "O nome deve ser uma string" })
    @MinLength(5, { message: "O nome deve ter no mínimo 5 caracteres" })
    @IsNotEmpty({ message: "O nome é obrigatório" })
    readonly name: string;

    @IsEmail({}, { message: "O email deve ser válido" })
    @IsNotEmpty({ message: "O email é obrigatório" })
    readonly email: string;

    @IsString()
    @MinLength(5)
    @IsNotEmpty()
    readonly passwordHash: string;

    @IsString({ message: "O campo avatar deverá ser uma string" })
    readonly avatar: string;
}