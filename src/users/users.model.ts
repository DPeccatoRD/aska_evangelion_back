import { BelongsToMany, Column, DataType, Model, Table } from "sequelize-typescript";
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Role } from "../roles/roles.model";
import { UserRoles } from "../roles/user-roles.model";

interface UserCreationAttrs {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface SafeUser extends Omit<User, 'password'> {}

@Table({tableName: 'users'})
export class User extends Model<User, UserCreationAttrs> {

    // Метод для получения объекта без пароля
    public toSafeObject(): SafeUser {
        const obj = this.toJSON();
        delete obj.password;
        return obj;
    }

    @ApiProperty({example: 1, description: 'Уникальный идентификатор'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 'user@gmail.com', description: 'Почтовый адрес'})
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    email: string;

    @ApiHideProperty()
    @Column({type: DataType.STRING, allowNull: false})
    password: string;

    @ApiProperty({example: 'true', description: 'Забанен или нет'})
    @Column({type: DataType.BOOLEAN, defaultValue: false})
    banned: boolean;

    @ApiProperty({example: 'Несоблюдение правил пользования', description: 'Причина блокировки'})
    @Column({type: DataType.STRING, allowNull: true})
    banReason: string;

    @ApiProperty({ example: 'Али', description: 'Имя пользователя' })
    @Column({ type: DataType.STRING, allowNull: false })
    firstName: string;

    @ApiProperty({ example: 'Байгеленов', description: 'Фамилия пользователя' })
    @Column({ type: DataType.STRING, allowNull: false })
    lastName: string;

    @BelongsToMany(() => Role, () => UserRoles)
    roles: Role[];
}
