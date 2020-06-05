import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Injectable({
    providedIn: 'root'
})
export class ExcelService {

    constructor() {
    }

    exportAsExcelFile(data: any, excelFileName: string): void {
        console.log(ExcelService.name, data, 'data');
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([], { header: ['Reports'] });
        console.log(data, 'data');
        XLSX.utils.sheet_add_json(
            worksheet, data,
        );
        const workbook: XLSX.WorkBook = {
            Sheets: { 'Export': worksheet },
            SheetNames: ['Export']
        };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }


    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        const self = this;
        FileSaver.saveAs(data, fileName + 'Export' + EXCEL_EXTENSION);
    }

    private getRandomNumber() {
        return Math.round(Math.random() * 100000);
    }

    private saveAsExcelFileDesktop(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        FileSaver.saveAs(data, fileName + 'Export' + EXCEL_EXTENSION);
    }

}