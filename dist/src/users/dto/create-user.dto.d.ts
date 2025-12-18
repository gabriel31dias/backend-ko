declare class AddressDto {
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
}
declare class DocumentsDto {
    name?: string;
    cpf?: string;
}
export declare class CreateUserDto {
    name: string;
    email: string;
    phone?: string;
    password: string;
    operationType?: string;
    averageTicket?: number;
    cpf?: string;
    cnpj?: string;
    corporateName?: string;
    salesPageLink?: string;
    address?: AddressDto;
    documents?: DocumentsDto;
}
export {};
//# sourceMappingURL=create-user.dto.d.ts.map