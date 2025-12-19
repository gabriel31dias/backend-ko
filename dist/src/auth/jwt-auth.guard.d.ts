import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users/users.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly usersService;
    private readonly reflector;
    constructor(jwtService: JwtService, usersService: UsersService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
//# sourceMappingURL=jwt-auth.guard.d.ts.map