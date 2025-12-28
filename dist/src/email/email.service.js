"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const mailersend_1 = require("mailersend");
let EmailService = class EmailService {
    constructor() {
        if (!process.env.MAILERSEND_API_TOKEN) {
            throw new Error('MAILERSEND_API_TOKEN environment variable is required');
        }
        this.mailerSend = new mailersend_1.MailerSend({
            apiKey: process.env.MAILERSEND_API_TOKEN,
        });
        this.sender = new mailersend_1.Sender(process.env.EMAIL_FROM || 'noreply@spinmaaser.com', 'SpinMaaser');
    }
    async sendVerificationCode(email, code, name) {
        const recipients = [new mailersend_1.Recipient(email, name)];
        const emailParams = new mailersend_1.EmailParams()
            .setFrom(this.sender)
            .setTo(recipients)
            .setSubject('Código de Verificação - SpinMaaser')
            .setHtml(this.getVerificationEmailTemplate(code, name));
        await this.mailerSend.email.send(emailParams);
    }
    getVerificationEmailTemplate(code, name) {
        return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de Verificação</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #454545; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: #33ACB9; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <svg width="80" height="80" viewBox="0 0 100 100" style="margin-bottom: 10px;">
            <circle cx="50" cy="50" r="40" fill="white"/>
            <text x="50" y="60" text-anchor="middle" fill="#33ACB9" font-size="24" font-weight="bold">SM</text>
          </svg>
          <h1 style="color: white; margin: 0; font-size: 28px;">SpinMaaser</h1>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #454545; margin-bottom: 25px; font-size: 24px;">Olá${name ? `, ${name}` : ''}!</h2>
          
          <p style="margin-bottom: 25px; color: #454545; font-size: 16px;">
            Obrigado por se cadastrar no SpinMaaser! Para concluir seu cadastro, 
            use o código de verificação abaixo:
          </p>
          
          <div style="background: #33ACB9; padding: 25px; border-radius: 10px; text-align: center; margin: 35px 0;">
            <h3 style="color: white; font-size: 36px; letter-spacing: 6px; margin: 0; font-weight: bold;">${code}</h3>
          </div>
          
          <p style="margin-bottom: 25px; color: #454545; font-size: 14px; line-height: 1.5;">
            Este código é válido por <strong>10 minutos</strong>. Se você não solicitou este cadastro, 
            pode ignorar este email com segurança.
          </p>
          
          <div style="border-top: 2px solid #33ACB9; padding-top: 25px; margin-top: 35px;">
            <p style="margin: 0; color: #454545; font-size: 16px;">
              Atenciosamente,<br>
              <strong style="color: #33ACB9;">Equipe SpinMaaser</strong>
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 25px; color: #454545; font-size: 12px; opacity: 0.7;">
          <p style="margin: 0;">Este é um email automático, não responda.</p>
        </div>
      </body>
      </html>
    `;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map