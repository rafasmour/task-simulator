import * as xlsx from 'xlsx';
import * as fs from 'fs';

export default class TaskExporter {
    public static excelExport(exportDir: string, sheets: string[], data: Record<string, object>[]) {
        const workbook = xlsx.utils.book_new();
        sheets.forEach((sheetName, index) => {
            const sheetData = data[index];
            const worksheet = xlsx.utils.json_to_sheet(Object.values(sheetData));
            xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
        });
        const filePath = `${exportDir}/task_report_${new Date().toISOString()}.xlsx`;
        xlsx.writeFile(workbook, filePath);
        console.log(`Excel report exported to ${filePath}`);
    }
}