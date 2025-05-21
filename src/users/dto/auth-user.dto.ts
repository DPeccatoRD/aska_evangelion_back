import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class AuthUserDto {

    @ApiProperty({example: 'user@gmail.com', description: 'Почта'})
    @IsString({message: 'Должно быть строкой'})
    @IsEmail({}, {message: "Некорректный email"})
    @Length(5, 60, {message: 'Не меньше 5 и не больше 60 символов'})
    readonly email: string;

    @ApiProperty({example: '12345', description: 'пароль'})
    @IsString({message: 'Должно быть строкой'})
    @Length(5, 60, {message: 'Не меньше 5 и не больше 60 символов'})
    readonly password: string;
}