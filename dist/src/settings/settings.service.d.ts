import { PrismaService } from '../prisma/prisma.service';
import { GlobalFeeSettings } from './entities/global-settings.entity';
import { UpdateGlobalFeesDto } from './dto/update-global-fees.dto';
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getGlobalFees(): Promise<GlobalFeeSettings>;
    updateGlobalFees(dto: UpdateGlobalFeesDto): Promise<GlobalFeeSettings>;
    getUserEffectiveFees(userId: string): Promise<GlobalFeeSettings>;
    private toDomain;
}
//# sourceMappingURL=settings.service.d.ts.map