import { UserService } from './../service/user.service';
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
import { ExcelService } from '../service/excel.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  db = firebase.firestore();
  title = 'Dashboard';
  querylist = [];
  filtredQuerylist = [];
  selectedQuery;
  searchQueryString = '';
  showLoader = false;
  originalData = [];
  dataFound = false;
  dataListWithOriginalStructure = [];
  tableheader = [];
  fireBaseAdminDocId;
  tableBody = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  queryString;
  currentUser;
  constructor(
    private sideNavService: SideNavService, public router: Router, public dialog: MatDialog,
    private exportService: ExcelService, private userService: UserService) {
  }

  ngOnInit() {
    this.getCurrentUser();
    this.getFireBaseAdminPannelId();
    if (this.tableBody) {
      this.tableBody.paginator = this.paginator;
      this.tableBody.sort = this.sort;
    }
  }

  getCurrentUser() {
    this.userService.getCurrentUserData().subscribe((data) => {
      console.log(data, 'current-user-data');
      if (data) {
        this.currentUser = data;
      }
    });
  }


  getFireBaseAdminPannelId() {
    const savedQuery = this.db.collection('avadutha_admin_pannel').get();
    const data = [];
    savedQuery.then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      if (data.length) {
        this.fireBaseAdminDocId = data[0].id;
        this.fecthSavedQuery(this.fireBaseAdminDocId);
        console.log(data, 'firebase-doc-id');
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableBody.filter = filterValue.trim().toLowerCase();
    if (this.tableBody.paginator) {
      this.tableBody.paginator.firstPage();
    }
  }

  clickMenu() {
    this.sideNavService.toggle();
  }

  selectQuery(query) {
    this.selectedQuery = query;
    console.log(query);
    this.queryString = query.query;
    const inputQuery = this.queryString.match(/{[a-z]*}/g);
    if (inputQuery) {
      this.checkTheInputQuery(inputQuery);
    } else {
      this.handleDataOperation(this.selectedQuery.query);
    }
  }

  searchQuery(value) {
    console.log('search value', value);
    this.querylist = filtreArrayWithNestedObject(this.filtredQuerylist, value, 0);
    console.log('search', this.querylist);
  }

  fecthSavedQuery(id) {
    const savedQuery = this.db.collection('avadutha_admin_pannel').doc(id)
      .collection('firebasequery')
      .orderBy('createdDate', 'desc').get();
    const data = [];
    savedQuery.then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      this.querylist = [...data];
      this.filtredQuerylist = [...this.querylist];
      console.log(this.querylist, 'query');
    });
  }

  handleDataOperation(query) {
    this.showLoader = true;
    this.dataFound = true;
    const queryData = eval(query);
    const data = [];
    this.originalData = [];
    this.dataListWithOriginalStructure = [];
    queryData.then((querySnapshot) => {
      console.log(querySnapshot, 'querySnapshot');
      querySnapshot.forEach((doc) => {
        const ref = doc.data();
        ref.ref = doc.ref;
        data.push(ref);
      });
      if (data instanceof Array && !data.length) {
        alert('No Data Found For Current Query');
        this.showLoader = false;
        return;
      }
      this.dataListWithOriginalStructure = [...data];
      this.originalData = [...data];
      const resultArray = this.handleDataStructureWithNextedObject(data);
      this.tableheader = this.getObjectUniqueKeys(resultArray);
      console.log(this.tableheader, 'tableheader');
      // to remove ref in header
      const index = this.tableheader.indexOf('ref');
      if (index > -1) {
        this.tableheader.splice(index, 1);
      }
      this.tableBody = new MatTableDataSource([...resultArray]);
      setTimeout(() => {
        this.tableBody.paginator = this.paginator;
        this.tableBody.sort = this.sort;
      }, 100);
      console.log(this.tableBody, 'tableBody');
      this.showLoader = false;
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

  getObjectUniqueKeys(array) {
    const uniqueKeys = Object.keys(array.reduce((result, obj) => {
      return Object.assign(result, obj);
    }, {}));
    return uniqueKeys.sort();
  }

  checkTheInputQuery(inputquery) {
    const dialogRef = this.dialog.open(QueryTitleComponent, {
      width: '450px',
      data: { modalTitle: 'Enter The Input', inputquery, isSaveQuery: false }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result, 'The dialog was closed');
      if (result) {
        for (const [key, value] of Object.entries(result)) {
          console.log(`${key}: ${value}`);
          this.queryString = this.queryString.replace(`${key}`, `${value}`);
        }
        console.log(this.queryString, 'querystring');
        try {
          this.handleDataOperation(this.queryString);
        } catch (err) {
          this.showLoader = false;
          this.queryString = 'this.db';
          alert(err);
        }
      } else {
        return;
      }
    });
  }


  typeOf(value) {
    return typeof value;
  }

  typeOfArray(isArray) {
    return Array.isArray(isArray);
  }

  checkLatAndLag(lat, lang) {
    if (lat && lang) {
      return true;
    } else if (lat) {
      return true;
    } else if (lang) {
      return true;
    } else {
      return false;
    }
  }

  checkSeconds(seconds) {
    if (seconds) {
      return true;
    } else {
      return false;
    }
  }


  findObjInItemList = (originalObj, key, obj, result) => {
    const nestedKeys = Object.keys(obj);
    nestedKeys.map((nkey) => {
      if (obj[nkey] && this.typeOf(obj[nkey]) == 'object') {
        if (obj[nkey] instanceof Array && obj[nkey].length) {
          result[key + '_' + nkey] = obj[nkey].toString();
        } else {
          result[key + '_' + nkey] = obj[nkey];
        }
        this.findObjInItemList(originalObj, key + '_' + nkey, obj[nkey], result);
      }
    });
  }

  trackByIndex(i) { return i; }

  logout() {
    firebase.auth().signOut().then(() => {
      console.log('logout');
      this.router.navigate(['/login']);
    }).catch((err) => {
      alert(err);
    });
  }

  handleDataStructureWithNextedObject(array: any) {
    const finalResult = [];
    let objKeys = [];
    array.forEach((item) => {
      const result = {};
      objKeys = Object.keys(item);
      objKeys.map((key) => {
        if (!item[key]) {
          return;
        } else {
          if (item[key] instanceof Array && item[key].length) {
            console.log(key, 'array-key');
            result[key] = item[key].toString();
          } else if (this.typeOf(item[key]) == 'object' && item[key] !== null &&
            item[key] !== undefined && item[key] !== '' && key !== 'ref' && !this.checkSeconds(item[key].seconds)
            && !this.checkLatAndLag(item[key].latitude ? item[key].latitude : null,
              item[key].longitude ? item[key].longitude : null)) {
            this.findObjInItemList(item, key, item[key], result);
          } else if (this.checkLatAndLag(item[key].latitude ? item[key].latitude : null,
            item[key].longitude ? item[key].longitude : null)) {
            const location = (item[key].latitude + ',' + item[key].longitude);
            console.log(location, 'location');
            result[key] = location;
          } else if (this.checkSeconds(item[key].seconds ? item[key].seconds : null)) {
            result[key] = new Date(item[key].seconds * 1000).toLocaleString();
          } else {
            result[key] = item[key];
          }
        }
      });
      finalResult.push(result);
      console.log(finalResult, 'finalResult');
    });
    return finalResult;
  }

  exportToExcel() {
    const data = [...this.originalData];
    const finalResult = [];
    data.forEach((item) => {
      const result = {};
      delete item.ref;
      const objKeys = Object.keys(item);
      objKeys.map((key) => {
        if (!item[key]) {
          return;
        } else {
          if (item[key] instanceof Array && item[key].length) {
            console.log(key, 'array-key');
            result[key] = item[key].toString();
          } else if (this.checkSeconds(item[key].seconds)) {
            result[key] = new Date(item[key].seconds * 1000);
          } else if (this.checkLatAndLag(item[key].latitude ? item[key].latitude : null,
            item[key].longitude ? item[key].longitude : null)) {
            result[key] = `${item[key].latitude},${item[key].longitude}`;
          } else if (this.typeOf(item[key]) == 'object' && item[key] !== null &&
            item[key] !== undefined && item[key] !== '' && !this.checkSeconds(item[key].seconds)
            && !this.checkLatAndLag(item[key].latitude ? item[key].latitude : null,
              item[key].longitude ? item[key].longitude : null)) {
            this.findObjInItem(item, key, item[key], result);
          } else {
            result[key] = item[key];
          }
        }
      });
      finalResult.push(result);
    });
    this.exportService.exportAsExcelFile(finalResult, 'data');
  }

  findObjInItem = (originalObj, key, obj, result) => {
    const nestedKeys = Object.keys(obj);
    nestedKeys.map((nkey) => {
      if (this.typeOf(obj[nkey]) == 'object') {
        console.log(obj[nkey], 'obj[nkey]-array-instance-before');
        this.findObjInItem(originalObj, key + '_' + nkey, obj[nkey], result);
      } else if (obj[nkey] instanceof Array && obj[nkey].length) {
        console.log(obj[nkey], 'obj[nkey]-array-instance');
        result[key + '_' + nkey] = obj[nkey].toString();
      } else {
        // console.log(obj[nkey], 'obj[nkey]-else');
        result[key + '_' + nkey] = obj[nkey];
      }
    });
  }
}
