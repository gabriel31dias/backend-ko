import { OnModuleInit } from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
export declare class ObjectivesSeedService implements OnModuleInit {
    private readonly objectivesService;
    constructor(objectivesService: ObjectivesService);
    onModuleInit(): Promise<void>;
}
//# sourceMappingURL=objectives-seed.service.d.ts.map