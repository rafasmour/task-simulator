import TaskReporter from "./TaskReporter";
import TaskScheduler from "./TaskScheduler";
import moment from "moment";

export interface TaskSimulatorInterface {
    start(): Record<string, object>;
}

export default class TaskSimulator implements TaskSimulatorInterface {
    constructor(
        public readonly name: string,
        private report: TaskReporter,
        private scheduler: TaskScheduler,
        private startTime: Date,
        private endTime: Date,
    ) {
    }

    start(): Record<string, object> {
        const currentTimeMoment = moment(this.startTime);
        console.log(`TaskSimulator ${this.name} started at ${currentTimeMoment.format('YYYY-MM-DD HH:mm:ss')}`);
        // we start without task so we fast forward to the first task generation
        const leastInterval = this.scheduler.leastInterval(currentTimeMoment.toDate())
        console.log(`Next task will be generated in ${leastInterval} minutes`);
        currentTimeMoment.add(
            leastInterval,
            'minutes'
        )
        do {
            this.scheduler.update(currentTimeMoment.toDate())
            console.log(`Tasks managed at ${currentTimeMoment.toDate()}`);
            const leastInterval = this.scheduler.leastInterval(currentTimeMoment.toDate())
            console.log(`Next task will be generated in ${leastInterval} minutes`);
            const report = this.scheduler.getCurrentState();
            this.report.appendReport(report, currentTimeMoment.toDate());
            currentTimeMoment.add(
                leastInterval,
                'minutes'
            )
        } while (currentTimeMoment.isBefore(moment(this.endTime)))
        return this.report.getOverviewReport();
    }
}