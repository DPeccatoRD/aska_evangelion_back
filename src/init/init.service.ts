import {Injectable, OnModuleInit} from '@nestjs/common';
import {RolesService} from '../roles/roles.service';
import {UsersService} from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class InitService implements OnModuleInit {
    constructor(
        private rolesService: RolesService,
        private usersService: UsersService,
        private configService: ConfigService,
    ) {
    }


    async onModuleInit() {
        await this.initializeRoles();
        await this.createDefaultAdmin();
    }

    private async initializeRoles() {
        const roles = ['ADMIN', 'USER'];
        const descriptions = ['Администратор', 'Пользователь'];

        for (let i = 0; i < roles.length; i++) {
            const existingRole = await this.rolesService.getRoleByValue(roles[i]);
            if (!existingRole) {
                await this.rolesService.createRole({
                    value: roles[i],
                    description: descriptions[i],
                });
                console.log(`Роль ${roles[i]} создана`);
            }
        }
    }

    private async createDefaultAdmin() {
        try {
            // Проверяем, существует ли хотя бы один администратор
            const users = await this.usersService.getAllUsers();
            const admins = users.filter(user =>
                user.roles.some(role => role.value === 'ADMIN')
            );

            if (admins.length === 0) {
                // Получаем данные из конфигурации
                const adminEmail = this.configService.get<string>('DEFAULT_ADMIN_EMAIL') || 'admin@example.com';
                const adminPassword = this.configService.get<string>('DEFAULT_ADMIN_PASSWORD') || 'admin123';
                const firstName = this.configService.get<string>('DEFAULT_ADMIN_FIRST_NAME') || 'Admin';
                const lastName = this.configService.get<string>('DEFAULT_ADMIN_LAST_NAME') || 'User';

                // Проверяем, существует ли пользователь с таким email
                const existingUser = await this.usersService.getUserByEmail(adminEmail);
                if (!existingUser) {
                    // Хешируем пароль
                    const hashedPassword = await bcrypt.hash(adminPassword, 10);

                    // Создаем админа напрямую через репозиторий (обходя проверку ролей)
                    await this.usersService.createUser({
                        email: adminEmail,
                        password: hashedPassword,
                        firstName,
                        lastName
                    }, 'ADMIN');

                    console.log(`Создан первый администратор с email: ${adminEmail}`);
                }
            }
        } catch (error) {
            console.error('Ошибка при создании администратора:', error);
        }
    }
}


