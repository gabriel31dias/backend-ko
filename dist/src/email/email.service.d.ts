export declare class EmailService {
    private mailerSend;
    private sender;
    constructor();
    sendVerificationCode(email: string, code: string, name?: string): Promise<void>;
    private getVerificationEmailTemplate;
}
//# sourceMappingURL=email.service.d.ts.map