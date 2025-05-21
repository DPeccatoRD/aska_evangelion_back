import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    private readonly logger = new Logger(JwtAuthGuard.name);

    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            this.logger.warn('Отсутствует заголовок авторизации');
            throw new UnauthorizedException({ message: 'Пользователь не авторизован' });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            this.logger.warn(`Неверный формат заголовка: ${authHeader}`);
            throw new UnauthorizedException({ message: 'Неверный формат токена' });
        }

        const [bearer, token] = parts;

        if (bearer !== 'Bearer') {
            this.logger.warn(`Неверный тип авторизации: ${bearer}, должен быть Bearer`);
            throw new UnauthorizedException({ message: 'Неверный тип авторизации' });
        }

        if (!token) {
            this.logger.warn('Токен отсутствует');
            throw new UnauthorizedException({ message: 'Токен не предоставлен' });
        }

        try {
            const user = this.jwtService.verify(token);
            this.logger.debug(`Декодированный токен: ${JSON.stringify(user)}`);
            req.user = user;
            return true;
        } catch (jwtError) {
            // Обрабатываем только ошибки JWT
            if (jwtError.name === 'TokenExpiredError') {
                this.logger.warn(`Срок действия токена истек: ${jwtError.message}`);
                throw new UnauthorizedException({ message: 'Срок действия токена истек' });
            } else if (jwtError.name === 'JsonWebTokenError') {
                this.logger.warn(`Ошибка проверки JWT: ${jwtError.message}`);
                throw new UnauthorizedException({ message: 'Недействительный токен' });
            } else {
                this.logger.error(`Ошибка проверки JWT: ${jwtError.message}`, jwtError.stack);
                throw new UnauthorizedException({ message: 'Ошибка проверки токена' });
            }
        }
    }
}
