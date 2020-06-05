import { TableDataService } from './../service/table.data.service';
import { CustommodalComponent } from './../custommodal/custommodal.component';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as firebase from 'firebase';


@Component({
  selector: 'app-deletecollectiondata',
  templateUrl: './deletecollectiondata.component.html',
  styleUrls: ['./deletecollectiondata.component.scss']
})
export class DeletecollectiondataComponent implements OnInit {
  labelList = [];
  currentData: any;
  deleteQueryString: any;
  db = firebase.firestore();
  constructor(private dataService: DataService,
    public dialog: MatDialog, private router: Router, private snackBar: MatSnackBar, private tableDataService: TableDataService) { }

  ngOnInit(): void {
    this.getCurrentCollectionData();
  }
  checkDateType(date) {
    return date instanceof Date;
  }


  getCurrentCollectionData() {
    this.dataService.getCurrentFirebaseCollectionData().subscribe((currentData) => {
      if (currentData) {
        console.log(currentData, 'currendata-delete');
        this.currentData = currentData;
        this.getData(this.currentData);
      }
    });
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

  deleteDoc() {
    const dialogRef = this.dialog.open(CustommodalComponent, {
      width: '500px',
      data: {
        modalTitle: 'Confirmation',
        modalContent: 'Did You Want To Delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result, 'The dialog was closed');
      if (result && result === 'ok') {
        try {
          const path = this.currentData.ref.path;
          this.db.doc(path).delete().then(() => {
            console.log('deleted');
            this.snackBar.open('Deleted SucessFully', '', {
              duration: 3000
            });
            this.tableDataService.setCurrentTableData({ data: [], query: "this.db.collection('')" });
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
    });


  }

  deleteQueryFromFirebase() {
    const dialogRef = this.dialog.open(CustommodalComponent, {
      width: '500px',
      data: {
        modalTitle: 'Confirmation',
        modalContent: 'Did You Want To Delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result, 'The dialog was closed');
      if (result && result === 'ok') {
        try {
          const deleteQuery = eval(this.deleteQueryString);
          deleteQuery.then(() => {
            console.log('deleted');
            this.deleteQueryString = '';

          }, (err) => {
            console.log(err, 'err');
            alert(err);
          }).catch((e) => {
            console.log('Error getting documents: ', e);
            alert(e);
          });
        } catch (er) {
          console.log(er, 'er');
          alert(er);
        }
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

}

