import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.validateCredentials(email, password);
    
    // Criar payload para o JWT
    const payload = { 
      sub: user.id, 
      email: user.email,
      name: user.name 
    };
    
    // Gerar JWT token
    const accessToken = this.jwtService.sign(payload);
    
    // Garantir que o usuário tem chaves de API
    const userWithKeys = await this.usersService.ensureApiKeysAndToken(user, accessToken);

    return {
      accessToken,
      user: {
        id: userWithKeys.id,
        name: userWithKeys.name,
        email: userWithKeys.email,
        status: userWithKeys.status,
        wallet: userWithKeys.wallet,
        publicKey: userWithKeys.publicKey,
        secretKey: userWithKeys.secretKey,
      },
    };
  }
}
