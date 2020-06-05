import { Injectable } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    currentCollectionData = null;
    private isFirebaseDataChangedSource = new Subject<any>();
    isFirebaseDataChangedObservable = this.isFirebaseDataChangedSource.asObservable();


    // set current firebase collection data
    setCurrentFirebaseCollectionData(data) {
        if (data) {
            this.currentCollectionData = data;
            this.isFirebaseDataChangedSource.next(data);
        }
    }

    // get current firebase collectio data
    getCurrentFirebaseCollectionData(): Observable<any> {
        if (this.currentCollectionData) {
            return of(this.currentCollectionData);
        } else {
            return this.isFirebaseDataChangedObservable;
        }
    }
}