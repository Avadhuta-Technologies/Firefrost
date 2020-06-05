import { Injectable } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TableDataService {
    currentTableData = null;
    private isFirebaseTableChangedSource = new Subject<any>();
    isFirebaseTableChangedObservable = this.isFirebaseTableChangedSource.asObservable();


    // set current firebase collection data
    setCurrentTableData(data) {
        if (data) {
            this.currentTableData = data;
            this.isFirebaseTableChangedSource.next(data);
        }
    }

    // get current firebase collectio data
    getCurrentTableData(): Observable<any> {
        if (this.currentTableData) {
            return of(this.currentTableData);
        } else {
            return this.isFirebaseTableChangedObservable;
        }
    }
}