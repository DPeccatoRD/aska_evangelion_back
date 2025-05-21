import { Body, Controller, Get, Param, Post, UseGuards, Logger } from '@nestjs/common';
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from "./roles.model";
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Роли')
@Controller('roles')
export class RolesController {
    private readonly logger = new Logger(RolesController.name);

    constructor(private roleService: RolesService) {}

    @ApiOperation({ summary: 'Создать роль' })
    @ApiResponse({ status: 200, type: Role })
    @Roles('ADMIN')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    create(@Body() dto: CreateRoleDto) {
        this.logger.log(`Получен запрос на создание роли: ${JSON.stringify(dto)}`);
        return this.roleService.createRole(dto);
    }

    @ApiOperation({ summary: 'Получить роль по значению' })
    @ApiResponse({ status: 200, type: Role })
    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Get('/:value')
    getByValue(@Param('value') value: string) {
        return this.roleService.getRoleByValue(value);
    }

    @ApiOperation({ summary: 'Получить все роли' })
    @ApiResponse({ status: 200, type: [Role] })
    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Get()
    getAllRoles() {
        return this.roleService.getAllRoles();
    }
}