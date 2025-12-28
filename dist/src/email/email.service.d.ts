export declare class EmailService {
    private transporter;
    constructor();
    sendVerificationCode(email: string, code: string, name?: string): Promise<void>;
    private getVerificationEmailTemplate;
}
//# sourceMappingURL=email.service.d.ts.map