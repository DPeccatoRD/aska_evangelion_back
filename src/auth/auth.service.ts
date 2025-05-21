import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import {SafeUser, User} from "../users/users.model";
import * as bcrypt from 'bcryptjs'
import  {AuthUserDto } from "../users/dto/auth-user.dto";

@Injectable()
export class AuthService {

    constructor(private userService: UsersService,
                private jwtService: JwtService) {}

    async login(userDto: AuthUserDto) {
        const user = await this.validateUser(userDto)
        return this.generateToken(user)
    }

    async registration(userDto: CreateUserDto) {
        const candidate = await this.userService.getUserByEmail(userDto.email);
        if (candidate) {
            throw new HttpException('Пользователь с таким email существует', HttpStatus.BAD_REQUEST);
        }
        const hashPassword = await bcrypt.hash(userDto.password, 10);
        const user = await this.userService.createUser({...userDto, password: hashPassword}, "USER")
        return this.generateToken(user)
    }

    private async generateToken(user: User | SafeUser) {
        const payload = {email: user.email, id: user.id, roles: user.roles}
        return {
            token: this.jwtService.sign(payload)
        }
    }

    private async validateUser(userDto: AuthUserDto) {
        const user = await this.userService.getUserByEmail(userDto.email, true);
        if (!user) {
            throw new UnauthorizedException({message: 'Некорректный емайл или пароль'});
        }

        const passwordEquals = await bcrypt.compare(userDto.password, user.password);
        if (passwordEquals) {
            return user;
        }

        throw new UnauthorizedException({message: 'Некорректный емайл или пароль'});
    }
}
