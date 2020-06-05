import { Component, OnInit, ViewChild } from '@angular/core';
import { SideNavService } from '../service/side-nav.service';
import * as firebase from 'firebase';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { QueryTitleComponent } from '../query-title/query-title.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { filtreArrayWithNestedObject } from '../helper/helper';
import { Router } from '@angular/router';
import { CustommodalComponent } from '../custommodal/custommodal.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  db = firebase.firestore();
  title = 'User Management';
  isCreateUser = false;
  isUserList = true;
  email;
  role;
  searchQueryString;
  showLoader = false;
  isActive;
  tableheader = [];
  selectedRowIndex = null;
  selectedRow;
  createbtnText = 'Create User'
  tableBody = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  fireBaseAdminDocId: string;
  roleList = [
    { name: 'user', value: 'user' },
    { name: 'admin', value: 'admin' },
  ];
  activelist = ['Active', 'InActive'];
  userList: any[];
  name: any;
  constructor(
    private sideNavService: SideNavService,
    public router: Router, public dialog: MatDialog,
    private snackBar: MatSnackBar, ) {
  }

  ngOnInit() {
    this.getFireBaseAdminPannelId();
    if (this.tableBody) {
      this.tableBody.paginator = this.paginator;
      this.tableBody.sort = this.sort;
    }
  }


  clickMenu() {
    this.sideNavService.toggle();
  }

  getFireBaseAdminPannelId() {
    const savedQuery = this.db.collection('avadutha_admin_pannel').get()
    const data = [];
    savedQuery.then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      if (data.length) {
        this.fireBaseAdminDocId = data[0].id;
        console.log(data, 'firebase-doc-id');
        this.fecthUserList(this.fireBaseAdminDocId);
      }
    });
  }

  showSideNav(mode) {
    this.selectedRowIndex = null;
    this.selectedRow = null;
    this.email = '';
    this.createbtnText = "Create User";
    this.role = '';
    this.name = '';
    if (mode === 'userlist') {
      this.isUserList = true;
      this.isCreateUser = false;
    } else {
      this.isCreateUser = true;
      this.isUserList = false;

    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableBody.filter = filterValue.trim().toLowerCase();
    if (this.tableBody.paginator) {
      this.tableBody.paginator.firstPage();
    }
  }

  cancel() {
    this.isCreateUser = false;
    this.isUserList = true;
    this.createbtnText = 'Create User';
  }

  fecthUserList(id) {
    this.showLoader = true;
    const savedQuery = this.db.collection('avadutha_admin_pannel')
      .doc(id)
      .collection('auth')
      .orderBy('createdDate', 'desc').get();
    const data = [];
    savedQuery.then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      this.showLoader = false;
      this.userList = [...data];
      this.userList = this.userList.map((item) => {
        if (item.createdDate && item.createdDate.seconds) {
          item.createdDate = new Date(item.createdDate.seconds * 1000).toDateString();
        }
        return item;
      });
      console.log(this.userList, 'userlist');
      this.tableheader = this.getObjectUniqueKeys(this.userList);
      this.tableBody = new MatTableDataSource([...this.userList]);
      this.tableBody.paginator = this.paginator;
      this.tableBody.sort = this.sort;
      console.log(this.tableheader, 'tableheader');
      console.log(this.tableBody, 'tableBody');

    }, (err) => {
      console.log(err, 'err');
      this.showLoader = false;
      alert(err);
    }).catch((error) => {
      console.log('Error getting documents: ', error);
      alert(error);
      this.showLoader = false;
    });
  }

  trackByIndex(i) { return i; }


  getObjectUniqueKeys(array) {
    const uniqueKeys = Object.keys(array.reduce((result, obj) => {
      return Object.assign(result, obj);
    }, {}));
    return uniqueKeys.sort();
  }

  selectRow(data) {
    if (data.id !== this.selectedRowIndex) {
      this.selectedRowIndex = data.id;
      this.selectedRow = data;
    } else {
      this.selectedRowIndex = null;
    }
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
          const path = this.db.collection('avadutha_admin_pannel')
            .doc(this.fireBaseAdminDocId)
            .collection('auth')
          path.doc(this.selectedRow.id).delete().then(() => {
            console.log('deleted');
            this.selectedRowIndex = null;
            this.snackBar.open('Deleted SucessFully', '', {
              duration: 3000
            });
            this.fecthUserList(this.fireBaseAdminDocId);
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

  editDoc() {
    this.isUserList = false;
    this.isCreateUser = true;
    this.createbtnText = 'Update User';
    if (this.selectedRow.id) {
      this.email = this.selectedRow.email;
      this.name = this.selectedRow.name;
      this.role = this.selectedRow.role;
      this.isActive = this.selectedRow.isActive ? 'Active' : 'InActive';
      this.selectedRowIndex = null;
    }
  }


  closeBtn() {
    this.selectedRowIndex = null;
  }

  createUser() {
    this.showLoader = true;
    const email = this.email;
    const role = this.role;
    const currentDate = new Date();
    const name = this.name;
    const isActive = this.isActive === 'Active' ? true : false;
    console.log(isActive, 'isActive');
    if (!this.selectedRow) {
      return this.db.collection('avadutha_admin_pannel')
        .doc(this.fireBaseAdminDocId)
        .collection('auth')
        .add({ email, isActive, role, createdDate: currentDate, name }).then((ref) => {
          ref.update({
            id: ref.id
          });
          this.snackBar.open('Created SucessFully', '', {
            duration: 3000
          });
          this.fecthUserList(this.fireBaseAdminDocId);
          setTimeout(() => {
            this.showLoader = false;
            this.isUserList = true;
            this.isCreateUser = false;
            this.email = '';
            this.role = '';
          }, 100);
        }, (err) => {
          console.log(err, 'err');
          alert(err);
        }).catch((e) => {
          console.log('Error getting documents: ', e);
          alert(e);
        });
    } else {
      return this.db.collection('avadutha_admin_pannel')
        .doc(this.fireBaseAdminDocId)
        .collection('auth').doc(this.selectedRow.id)
        .update({ email, isActive, role, createdDate: currentDate, name }).then(() => {
          this.snackBar.open('Updated SucessFully', '', {
            duration: 3000
          });
          this.fecthUserList(this.fireBaseAdminDocId);
          this.showLoader = false;
          this.isUserList = true;
          this.isCreateUser = false;
        }, (err) => {
          console.log(err, 'err');
          alert(err);
        }).catch((e) => {
          console.log('Error getting documents: ', e);
          alert(e);
        });
    }
  }
}
