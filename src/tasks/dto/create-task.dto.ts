import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateTaskDto{
    @IsString({ message: "O nome deve ser uma string" })
    @MinLength(5, { message: "O nome deve ter no mínimo 5 caracteres" })
    @IsNotEmpty({ message: "O nome é obrigatório" })
    readonly name: string;

    @IsString()
    @MinLength(5)
    @IsNotEmpty()
    readonly description: string;
}