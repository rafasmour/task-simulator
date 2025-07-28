export type YamlParseResult = {
    TaskSpawners: TaskSpawners,
    TaskExecuters: string[],
    TaskReporters: string[],
    TaskSchedulers: TaskSchedulers,
    TaskSimulators: TaskSimulators,
}

export type TaskSpawners = {
    [name: string]: {
        taskInterval: number;
        taskToSpawn: number;
        priority: number;
        executersAssigned: string[];
        taskTemplate: {
            name: string;
            duration: number;
        }
    }
}

export type TaskSchedulers = {
    [name: string]: {
        taskSpawners: string[];
        taskExecuters: string[];
    }
}
export type TaskSimulators = {
    [name: string]: {
        startTime: string;
        endTime: string;
        scheduler: string;
        report: string;
    }
}