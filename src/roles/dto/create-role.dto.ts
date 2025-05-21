import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({ example: 'ADMIN', description: 'Уникальное значение роли' })
    @IsString({ message: "Значение роли должно быть строкой" })
    @IsNotEmpty({ message: "Значение роли не может быть пустым" })
    readonly value: string;

    @ApiProperty({ example: 'Администратор', description: 'Описание роли' })
    @IsString({ message: "Описание роли должно быть строкой" })
    @IsNotEmpty({ message: "Описание роли не может быть пустым" })
    readonly description: string;
}
