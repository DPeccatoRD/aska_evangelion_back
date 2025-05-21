import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from "./dto/create-role.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Role } from "./roles.model";

@Injectable()
export class RolesService {
    private readonly logger = new Logger(RolesService.name);

    constructor(@InjectModel(Role) private roleRepository: typeof Role) {}

    async createRole(dto: CreateRoleDto) {
        if (!dto.value || !dto.description) {
            this.logger.warn(`Попытка создания роли с неполными данными: ${JSON.stringify(dto)}`);
            throw new BadRequestException('Поля value и description обязательны');
        }

        try {
            this.logger.log(`Попытка создания роли: ${dto.value}`);
            return await this.roleRepository.create({
                value: dto.value,
                description: dto.description
            });
        } catch (error) {
            this.logger.error(`Ошибка при создании роли: ${error.message}`, error.stack);
            throw error;
        }
    }


    async getRoleByValue(value: string) {
        this.logger.log(`Поиск роли: ${value}`);

        const role = await this.roleRepository.findOne({ where: { value } });

        if (!role) {
            this.logger.warn(`Роль не найдена: ${value}`);
            throw new NotFoundException(`Роль со значением ${value} не найдена`);
        }

        return role;
    }


    async getAllRoles() {
        try {
            this.logger.log('Получение всех ролей');
            return await this.roleRepository.findAll();
        } catch (error) {
            this.logger.error(`Ошибка при получении всех ролей: ${error.message}`, error.stack);
            throw error;
        }
    }
}