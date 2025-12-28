# Configuração de Email com MailHog

Este projeto está configurado para enviar emails de verificação durante o cadastro. Para desenvolvimento e testes, utilizamos o MailHog.

## MailHog - Servidor de Email para Testes

O MailHog é uma ferramenta que intercepta emails enviados pela aplicação e permite visualizá-los numa interface web, sem enviar emails reais.

### Como usar

1. **Iniciar o MailHog com Docker Compose**:
   ```bash
   docker-compose up -d mailhog
   ```

2. **Configurar as variáveis de ambiente**:
   - Copie o arquivo `.env.development` ou configure manualmente:
   ```bash
   cp .env.development .env
   ```

3. **Acessar a interface web**:
   - Abra o navegador em: http://localhost:8025
   - Todos os emails enviados pela aplicação aparecerão aqui

4. **Testar o envio de email**:
   - Faça um cadastro na aplicação
   - O email com código de verificação aparecerá na interface do MailHog

### Configuração das Variáveis de Ambiente

Para **desenvolvimento** com MailHog:
```env
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@spinmaaser.com
```

Para **produção** com provedor real (Gmail, SendGrid, etc.):
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-ou-app-password
EMAIL_FROM=noreply@spinmaaser.com
```

## Portas utilizadas

- **1025**: Porta SMTP do MailHog (para aplicação enviar emails)
- **8025**: Interface web do MailHog (para visualizar emails)

## Comandos úteis

```bash
# Iniciar apenas o MailHog
docker-compose up -d mailhog

# Ver logs do MailHog
docker-compose logs -f mailhog

# Parar o MailHog
docker-compose stop mailhog

# Remover dados do MailHog (limpar emails salvos)
docker-compose down mailhog
docker volume rm backend_mailhog_data
```

## APIs de Email Disponíveis

### 1. Cadastro de usuário (automático)
- **Endpoint**: `POST /users`
- Envia automaticamente um código de verificação por email

### 2. Verificar código de email
- **Endpoint**: `POST /users/verify-email`
- **Body**: 
  ```json
  {
    "email": "usuario@exemplo.com",
    "code": "123456"
  }
  ```

### 3. Reenviar código de verificação
- **Endpoint**: `POST /users/resend-verification`
- **Body**: 
  ```json
  {
    "email": "usuario@exemplo.com"
  }
  ```

## Estrutura do Email

O email enviado contém:
- Saudação personalizada com o nome do usuário
- Código de 6 dígitos
- Validade de 10 minutos
- Layout responsivo e visual atrativo

## Troubleshooting

### MailHog não está recebendo emails
1. Verifique se o container está rodando: `docker-compose ps`
2. Verifique as variáveis de ambiente
3. Verifique os logs: `docker-compose logs mailhog`

### Emails não estão sendo enviados
1. Verifique a configuração no arquivo `.env`
2. Verifique os logs da aplicação
3. Teste a conectividade: `telnet localhost 1025`