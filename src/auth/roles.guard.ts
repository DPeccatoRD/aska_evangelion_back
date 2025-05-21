import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    Logger,
    UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles-auth.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector
    ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            this.logger.warn('Отсутствует заголовок авторизации');
            throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            this.logger.warn(`Неверный формат заголовка авторизации: ${authHeader}`);
            throw new UnauthorizedException({ message: 'Неверный формат токена' });
        }

        const token = parts[1];
        if (!token) {
            this.logger.warn('Токен отсутствует');
            throw new UnauthorizedException({ message: 'Токен не предоставлен' });
        }

        let user: any;
        try {
            user = this.jwtService.verify(token);
            req.user = user;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                this.logger.warn('Срок действия токена истёк');
                throw new UnauthorizedException({ message: 'Срок действия токена истёк' });
            } else if (error.name === 'JsonWebTokenError') {
                this.logger.warn(`Недействительный токен: ${error.message}`);
                throw new UnauthorizedException({ message: 'Недействительный токен' });
            }

            this.logger.error(`Ошибка авторизации: ${error.message}`, error.stack);
            throw new ForbiddenException('Ошибка проверки прав доступа');
        }

        const hasRole = user.roles?.some((role: { value: string; }) => requiredRoles.includes(role.value));
        if (!hasRole) {
            this.logger.warn(`У пользователя нет нужной роли. Требуемые: ${requiredRoles.join(', ')}`);
            throw new ForbiddenException('Недостаточно прав');
        }

        return true;
    }
}
