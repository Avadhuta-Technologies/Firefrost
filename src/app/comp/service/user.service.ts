import { Injectable } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    currentUserData = null;
    private isFirebaseuserChangedSource = new Subject<any>();
    isFirebaseUserChangedObservable = this.isFirebaseuserChangedSource.asObservable();


    // set current firebase collection data
    setCurrentUserData(data) {
        if (data) {
            this.currentUserData = data;
            this.isFirebaseuserChangedSource.next(data);
        }
    }

    // get current firebase collectio data
    getCurrentUserData(): Observable<any> {
        if (this.currentUserData) {
            return of(this.currentUserData);
        } else {
            return this.isFirebaseUserChangedObservable;
        }
    }
}