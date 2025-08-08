import {TaskOverviewReport, TaskSchedulerReport} from "./types/TaskExecuter.types";

export interface TaskReporterInterface {
    appendReport(report: object, time: Date): void;
    getReport(): Record<string, TaskSchedulerReport>;
    getOverviewReport(): TaskOverviewReport[];
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
    private get
    getDetailedReport() {
        const detailedReport = [];
        const timestamps = Object.keys(this.report);
        timestamps.forEach((timestamp) => {
            const timeStampReport = this.report[timestamp];
            const taskSpawnerReport = Object.values(timeStampReport.taskSpawners).map(spawner => {
                return {
                    [`${spawner.name} completedTasks`]: spawner.completedTasks.length,
                    [`${spawner.name} tasks`]: spawner.tasks.length,
                };
            });
            const taskExecuterReport = Object.values(timeStampReport.taskExecuters).map(executer => {
                return {
                    [`${executer.name} busy`]: `${executer.busy ? `Executing task ${Object.values(timeStampReport)}` : 'is not busy'}`,
                };
            });
        })

    }
    getOverviewReport(): TaskOverviewReport[] {
        const overview: TaskOverviewReport[] = [];
        const timestamps = Object.keys(this.report);
        timestamps.forEach((timestamp) => {
            const timeStampReport = this.report[timestamp];
            const taskSpawnerValues = Object.values(timeStampReport.taskSpawners);
            const completedTasks = taskSpawnerValues
                .map(spawner => spawner.completedTasks.length)
                .reduce((a, b) => a + b, 0);
            const tasks = taskSpawnerValues
                .map(spawner => spawner.tasks.length)
                .reduce((a, b) => a + b, 0);
            const executersBusy = Object.values(timeStampReport.taskExecuters)
                .filter(executer => executer.busy).length;
            overview.push({
                timestamp,
                completedTasks,
                tasks,
                executersBusy
            });
        })
        return overview;
    }
}