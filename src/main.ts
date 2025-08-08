#!/usr/bin/env -S npx ts-node
import {parse} from 'yaml';
import * as path from 'path';
import * as fs from 'fs';
import {YamlParseResult} from "./types/parse";
import Task from "./Task";
import TaskExecuter from "./TaskExecuter";
import TaskReporter from "./TaskReporter";
import TaskSpawner from "./TaskSpawner";
import TaskScheduler from "./TaskScheduler";
import TaskSimulator from "./TaskSimulator";
import env from "./env";
import TaskExporter from "./TaskExporter";


const dataDir = env.DATA_DIR;
const ymlToRead = env.YML_TO_READ;
console.log(`Reading YAML file from: ${dataDir}/${ymlToRead}`);
if (!dataDir || !ymlToRead) {
    throw new Error('DATA_DIR and YML_TO_READ environment variables must be set');
}
const rootDir = path.resolve(__dirname, '../');
const dataPath = path.join(rootDir, dataDir, ymlToRead);
const exportDir = path.join(rootDir, dataDir, 'export');
if(!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
}
function main() {
    try {
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        const data: YamlParseResult = parse(fileContent);
        const taskExecuters = data.TaskExecuters.map((name: string) => new TaskExecuter(name));
        const taskReporters = data.TaskReporters.map((name: string) => new TaskReporter(name));
        const taskSpawners = Object.entries(data.TaskSpawners).map(([name, config]) => {
            const taskTemplate = config.taskTemplate;
            if (Object.values(config).length === 0 || !taskTemplate) {
                throw new Error(`Task template not found for spawner ${name}`);
            }
            const taskInterval = config.taskInterval;
            return new TaskSpawner(
                name,
                config.tasksToSpawn,
                new Task(taskTemplate.name, taskTemplate.duration),
                config.taskInterval,
                config.priority,
                config.executersAssigned
            )
        })
        const taskSchedulers = Object.entries(data.TaskSchedulers).map(([name, config]) => {
            if (Object.values(config).length === 0 || !config.taskSpawners || !config.taskExecuters) {
                throw new Error(`Task spawners or executers not found for scheduler ${name}`);
            }
            return new TaskScheduler(
                name,
                taskSpawners.filter(spawner => config.taskSpawners.includes(spawner.name)),
                taskExecuters.filter(executer => config.taskExecuters.includes(executer.name))
            )
        })
        const taskSimulators = Object.entries(data.TaskSimulators).map(([name, config]) => {
            if (Object.values(config).length === 0 || !config.startTime || !config.endTime) {
                throw new Error(`Start time or end time not found for simulator ${name}`);
            }
            const reporter = taskReporters.find(reporter => reporter.name === config.report);
            const scheduler = taskSchedulers.find(scheduler => scheduler.name === config.scheduler);
            if (!reporter) {
                throw new Error(`Reporter not found for simulator ${name}`);
            }
            if (!scheduler) {
                throw new Error(`Scheduler not found for simulator ${name} should be named ${config.scheduler}`);
            }
            return new TaskSimulator(
                name,
                reporter,
                scheduler,
                new Date(config.startTime),
                new Date(config.endTime)
            )
        })
        const reports = taskSimulators.map((simulator) => {
           return simulator.start();
        })
        reports.forEach((report, index) => {
            TaskExporter.excelExport(exportDir, [`Report ${index + 1}`], [report]);
        })
    } catch (error) {
        console.error('Error reading YAML file:', error);
    }
}

main();