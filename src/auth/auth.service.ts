import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(email: string, password: string) {
    const user = await this.usersService.validateCredentials(email, password);
    
    // Garantir que o usuário tem chaves de API e gerar novo token
    const accessToken = randomUUID();
    const userWithKeysAndToken = await this.usersService.ensureApiKeysAndToken(user, accessToken);

    return {
      accessToken,
      user: {
        id: userWithKeysAndToken.id,
        name: userWithKeysAndToken.name,
        email: userWithKeysAndToken.email,
        wallet: userWithKeysAndToken.wallet,
        publicKey: userWithKeysAndToken.publicKey,
        secretKey: userWithKeysAndToken.secretKey,
      },
    };
  }
}
