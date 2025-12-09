import { SettingsService } from './settings.service';
import { UpdateGlobalFeesDto } from './dto/update-global-fees.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getGlobalFees(): Promise<import("./entities/global-settings.entity").GlobalFeeSettings>;
    updateGlobalFees(dto: UpdateGlobalFeesDto): Promise<import("./entities/global-settings.entity").GlobalFeeSettings>;
}
//# sourceMappingURL=settings.controller.d.ts.map