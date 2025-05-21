import { ApiProperty } from "@nestjs/swagger";
import {IsNumber, IsPositive, IsString} from "class-validator";

export class BanUserDto {
    @ApiProperty({ example: 1, description: 'ID пользователя' })
    @IsNumber({}, {message: "Должно быть числом"})
    @IsPositive({message: "ID должен быть положительным числом"})
    readonly userId: number;
    @IsString({ message: "Должна быть строкой" })
    @ApiProperty({ example: 'Несоблюдение правил пользования', description: 'Причина блокировки' })
    readonly banReason: string;
}
