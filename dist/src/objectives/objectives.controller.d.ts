import { ObjectivesService } from './objectives.service';
export declare class ObjectivesController {
    private readonly objectivesService;
    constructor(objectivesService: ObjectivesService);
    getMyObjectives(req: any): Promise<{
        totalRevenue: number;
        currentLevel: {
            id: any;
            name: any;
            targetAmount: any;
            description: any;
        };
        nextLevel: {
            id: any;
            name: any;
            targetAmount: any;
            description: any;
            remaining: number;
        };
        progress: number;
    }>;
}
//# sourceMappingURL=objectives.controller.d.ts.map