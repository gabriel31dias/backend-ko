import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private apiKey: string;
  private domain: string;
  private baseUrl: string;

  constructor() {
    if (!process.env.MAILGUN_API_KEY) {
      throw new Error('MAILGUN_API_KEY environment variable is required');
    }
    
    if (!process.env.MAILGUN_DOMAIN) {
      throw new Error('MAILGUN_DOMAIN environment variable is required');
    }

    this.apiKey = process.env.MAILGUN_API_KEY;
    this.domain = process.env.MAILGUN_DOMAIN;
    this.baseUrl = `https://api.mailgun.net/v3/${this.domain}`;
  }

  async sendVerificationCode(email: string, code: string, name?: string): Promise<void> {
    const formData = new URLSearchParams();
    formData.append('from', `Konnecta <postmaster@${this.domain}>`);
    formData.append('to', name ? `${name} <${email}>` : email);
    formData.append('subject', 'Código de Verificação - Konnecta');
    formData.append('html', this.getVerificationEmailTemplate(code, name));

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, resetLink: string, name?: string): Promise<void> {
    const formData = new URLSearchParams();
    formData.append('from', `Konnecta <postmaster@${this.domain}>`);
    formData.append('to', name ? `${name} <${email}>` : email);
    formData.append('subject', 'Recuperação de Senha - Konnecta');
    formData.append('html', this.getPasswordResetEmailTemplate(resetLink, name));

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  private getVerificationEmailTemplate(code: string, name?: string): string {
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
          <h1 style="color: white; margin: 0; font-size: 28px;">Konnecta</h1>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #454545; margin-bottom: 25px; font-size: 24px;">Olá${name ? `, ${name}` : ''}!</h2>
          
          <p style="margin-bottom: 25px; color: #454545; font-size: 16px;">
            Obrigado por se cadastrar no Konnecta! Para concluir seu cadastro, 
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
              <strong style="color: #33ACB9;">Equipe Konnecta</strong>
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

  private getPasswordResetEmailTemplate(resetLink: string, name?: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de Senha</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #454545; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: #33ACB9; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Konnecta</h1>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #454545; margin-bottom: 25px; font-size: 24px;">Olá${name ? `, ${name}` : ''}!</h2>
          
          <p style="margin-bottom: 25px; color: #454545; font-size: 16px;">
            Recebemos uma solicitação para redefinir a senha da sua conta no Konnecta. 
            Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha:
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetLink}" 
               style="background: #33ACB9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          
          <p style="margin-bottom: 15px; color: #454545; font-size: 14px;">
            Ou copie e cole este link no seu navegador:
          </p>
          
          <p style="margin-bottom: 25px; color: #33ACB9; font-size: 14px; word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">
            ${resetLink}
          </p>
          
          <p style="margin-bottom: 25px; color: #454545; font-size: 14px; line-height: 1.5;">
            Este link é válido por <strong>1 hora</strong>. Se você não solicitou a redefinição de senha, 
            pode ignorar este email com segurança. Sua senha atual permanecerá inalterada.
          </p>
          
          <div style="border-top: 2px solid #33ACB9; padding-top: 25px; margin-top: 35px;">
            <p style="margin: 0; color: #454545; font-size: 16px;">
              Atenciosamente,<br>
              <strong style="color: #33ACB9;">Equipe Konnecta</strong>
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 25px; color: #454545; font-size: 12px; opacity: 0.7;">
          <p style="margin: 0;">Este é um email automático, não responda.</p>
          <p style="margin: 5px 0 0 0;">Por motivos de segurança, não compartilhe este link com ninguém.</p>
        </div>
      </body>
      </html>
    `;
  }
}