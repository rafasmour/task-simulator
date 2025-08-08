export type TaskSchedulerReport = {
    taskSpawners: Record<string, {
        completedTasks: {
            name: string;
            duration: number;
            spawnTime: Date | null;
            startTime: Date | null;
            stopTime: Date | null;
            executerAssigned: string | null;
        }[];
        tasks: {
            name: string;
            duration: number;
            startTime: Date | null;
            stopTime: Date | null;
            executerAssigned: string | null;
        }[];
        priority: number;
        executersAssigned: string[];
    }>;
    taskExecuters: Record<string, {
        busy: boolean;
    }>;
};

export type TaskOverviewReport = Record<string, {
    completedTasks: number;
    tasks: number;
    executersBusy: number;
}>