import {TaskOverviewReport, TaskSchedulerReport} from "./types/TaskExecuter.types";

export interface TaskReporterInterface {
    appendReport(report: object, time: Date): void;
    getReport(): Record<string, TaskSchedulerReport>;
    getOverviewReport(): Record<string, TaskOverviewReport>;
}

export default class TaskReporter implements TaskReporterInterface {
    public readonly name: string;
    private readonly report: Record<string, TaskSchedulerReport>;

    constructor(name: string) {
        this.name = name;
        this.report = {};
    }

    public getName(): string {
        return this.name;
    }

    public getReport(): Record<string, TaskSchedulerReport> {
        return this.report;
    }

    public appendReport(report: TaskSchedulerReport, time: Date): void {
        const timestamp = time.toISOString();
        this.report[timestamp] = report;
    }

    getOverviewReport() {
        const overview: Record<string, TaskOverviewReport> = {};
        const timestamps = Object.keys(this.report);
        timestamps.forEach((timestamp) => {
            const taskReport = this.report[timestamp];
            const overviewEntry: TaskOverviewReport = {};

            Object.keys(taskReport.taskSpawners).forEach((spawnerName) => {
                const spawner = taskReport.taskSpawners[spawnerName];
                overviewEntry[spawnerName] = {
                    completedTasks: spawner.completedTasks.length,
                    tasks: spawner.tasks.length,
                    executersBusy: spawner.executersAssigned.filter(executer => taskReport.taskExecuters[executer].busy).length
                };
            });

            overview[timestamp] = overviewEntry;
        });
        return overview;
    }
}