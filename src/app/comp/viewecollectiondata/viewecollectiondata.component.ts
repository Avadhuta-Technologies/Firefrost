import { CustommodalComponent } from './../custommodal/custommodal.component';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-viewecollectiondata',
  templateUrl: './viewecollectiondata.component.html',
  styleUrls: ['./viewecollectiondata.component.scss']
})
export class ViewecollectiondataComponent implements OnInit {
  labelList = [];
  currentData: any;
  originalData;
  constructor(private dataService: DataService, public dialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
    this.getCurrentCollectionData();
  }

  getCurrentCollectionData() {
    this.dataService.getCurrentFirebaseCollectionData().subscribe((currentData) => {
      if (currentData) {
        console.log(currentData, 'currendata-view');
        this.originalData = currentData;
        this.currentData = currentData.selectedRow;
        this.getData(this.currentData);
      }
    });
  }

  checkDateType(date) {
    return date instanceof Date;
  }


  getData(data) {
    const alllabels = this.getObjectKeys(data);
    // to remove ref in header
    const index = alllabels.indexOf('ref');
    if (index > -1) {
      alllabels.splice(index, 1);
    }
    this.labelList = alllabels;
    console.log(this.labelList, 'labelata');
  }

  getObjectKeys = (obj) => {
    return Object.keys(obj);
  }

  checkLatAndLag = (lat) => {
    if (lat) {
      return true;
    } else {
      return false;
    }
  }

  checkSecondsForTimeStamp = (seconds) => {
    if (seconds) {
      return true;
    } else {
      return false;
    }
  }

  setDate = (seconds) => {
    return new Date(seconds * 1000);
  }

  typeOf = (value) => {
    return typeof value;
  }

  typeOfArray = (isArray) => {
    return Array.isArray(isArray);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  goToEdit() {
    this.dataService.setCurrentFirebaseCollectionData(this.originalData.originalDataObj);
    this.router.navigate(['/edit-page']);
  }

}
