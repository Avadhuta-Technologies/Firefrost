import { TableDataService } from './../service/table.data.service';
import { CustommodalComponent } from './../custommodal/custommodal.component';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as firebase from 'firebase';
import { FormControl, FormGroup } from "@angular/forms";
@Component({
  selector: 'app-editcollectiondata',
  templateUrl: './editcollectiondata.component.html',
  styleUrls: ['./editcollectiondata.component.scss']
})
export class EditcollectiondataComponent implements OnInit {
  labelList = [];
  currentData: any;
  deleteQueryString: any;
  editedData;
  editQueryString;
  db = firebase.firestore();
  myForm: FormGroup;
  myKeys = [];
  sampleJson;
  constructor(private dataService: DataService,
    public dialog: MatDialog, private router: Router, private snackBar: MatSnackBar, private tableDataService: TableDataService) { }

  ngOnInit(): void {
    this.getCurrentCollectionData();
  }

  getCurrentCollectionData() {
    this.dataService.getCurrentFirebaseCollectionData().subscribe((currentData) => {
      console.log(currentData, 'currentdata');
      if (currentData) {
        this.currentData = { ...currentData };
        console.log(this.currentData, 'currentdata');
        // delete currentData.ref;
        this.myForm = this.getFormGroupControls(currentData, this.myKeys);
      }
    });
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


  typeOf = (value) => {
    return typeof value;
  }

  typeOfArray = (isArray) => {
    return Array.isArray(isArray);
  }

  updateDoc(data) {
    for (const key in data) {
      if (data[key] && data[key]['Ic'] && data[key]['wc']) {
        data[key] = new firebase.firestore.GeoPoint(+(data[key]['Ic']), +(data[key]['wc']));
      }
    }
    try {
      const editdata = { ...data };
      console.log(editdata, 'final-editdata');
      const path = this.currentData.ref.path;
      this.db.doc(path).update(editdata).then(() => {
        console.log('updated');
        this.snackBar.open('Updated SucessFully', '', {
          duration: 3000
        });
        this.tableDataService.setCurrentTableData({ data: null, query: "this.db.collection('')" });
        this.router.navigate(['/']);
      }, (err) => {
        console.log(err, 'err');
        alert(err);
      }).catch((e) => {
        console.log('Error getting documents: ', e);
        alert(e);
      });
    } catch (err) {
      console.log(err, 'er');
      alert(err);
    }

  }


  getFormGroupControls(obj: any, keys): FormGroup {
    const controls = {};
    let value = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && key !== 'ref') {
        value = obj[key];
        if (value instanceof Object && !this.checkSecondsForTimeStamp(value['seconds']) && !this.typeOfArray(value)) {
          keys.push({ "key": key, children: [] });
          controls[key] = this.getFormGroupControls(value, keys[keys.length - 1].children);
        } else {
          if (value && this.checkSecondsForTimeStamp(value['seconds'])) {
            value = new Date(value['seconds'] * 1000);
          }
          keys.push({ "key": key, children: [] });
          controls[key] = new FormControl(value);
        }
      }
    }
    return new FormGroup(controls);
  }

  getNodeKey(node) {
    return node.key;
  }

  goBack() {
    this.router.navigate(['/']);
  }

}