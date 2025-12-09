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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentLinksController = void 0;
const common_1 = require("@nestjs/common");
const create_payment_link_dto_1 = require("./dto/create-payment-link.dto");
const pay_link_dto_1 = require("./dto/pay-link.dto");
const payment_links_service_1 = require("./payment-links.service");
const public_decorator_1 = require("../auth/public.decorator");
let PaymentLinksController = class PaymentLinksController {
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    findAll() {
        return this.service.findAll();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    pay(id, dto) {
        return this.service.registerPayment(id, dto);
    }
};
exports.PaymentLinksController = PaymentLinksController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_link_dto_1.CreatePaymentLinkDto]),
    __metadata("design:returntype", void 0)
], PaymentLinksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentLinksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentLinksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pay_link_dto_1.PayLinkDto]),
    __metadata("design:returntype", void 0)
], PaymentLinksController.prototype, "pay", null);
exports.PaymentLinksController = PaymentLinksController = __decorate([
    (0, common_1.Controller)('payment-links'),
    __metadata("design:paramtypes", [payment_links_service_1.PaymentLinksService])
], PaymentLinksController);
//# sourceMappingURL=payment-links.controller.js.map