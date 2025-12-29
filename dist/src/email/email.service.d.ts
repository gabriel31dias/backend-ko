export declare class EmailService {
    private apiKey;
    private domain;
    private baseUrl;
    constructor();
    sendVerificationCode(email: string, code: string, name?: string): Promise<void>;
    sendPasswordResetEmail(email: string, resetLink: string, name?: string): Promise<void>;
    private getVerificationEmailTemplate;
    private getPasswordResetEmailTemplate;
}
//# sourceMappingURL=email.service.d.ts.map