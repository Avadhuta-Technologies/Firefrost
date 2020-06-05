import { UserService } from './../service/user.service';
import { TableDataService } from './../service/table.data.service';
import { DataService } from './../service/data.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import { QueryTitleComponent } from '../query-title/query-title.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filtreArrayWithNestedObject } from '../helper/helper';
import { ExcelService } from '../service/excel.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  tableheader = [];
  tableBody = new MatTableDataSource<any>([]);
  searchString;
  selectedQuery = '';
  queryTitle = '';
  selectedRowIndex: any;
  selectedRow: any;
  fireBaseAdminDocId: any;
  searchArray = [];
  originalData = [];
  dataFound = false;
  dataListWithOriginalStructure = [];
  searchParams;
  resultArrayAfterStructure = [];
  queryString = "this.db.collection('')";
  newKeysOfobject = [];
  color: ThemePalette = 'primary';
  mode = 'Indeterminate';
  value = 50;
  showLoader = false;
  currentUser;
  querylist = [];
  filtredQuerylist = [];
  currentFirebaseConfig = null;
  db = firebase.firestore();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  schools;
  constructor(public dialog: MatDialog, public router: Router, private dataService: DataService,
    private tableDataService: TableDataService,
    private snackBar: MatSnackBar, private excelService: ExcelService, private userService: UserService) {
  }

  ngOnInit() {
    if (this.tableBody) {
      this.tableBody.paginator = this.paginator;
      this.tableBody.sort = this.sort;
    }
    this.getTableDataToService();
    this.getFireBaseAdminPannelId();
    this.getCurrentUser();

  }

  goToConfigurePage() {
    this.router.navigate(['/configure-firebase']);
  }

  getData() {
    this.reset();
    console.log(this.queryString, 'this.queryString');
    const inputQuery = this.queryString.match(/{[A-Za-z]*}/g);
    if (inputQuery) {
      this.checkTheInputQuery(inputQuery);
    } else {
      if (!this.queryString.includes('.collection')) {
        alert('Please add a collection or collectionGroup  to continue');
        return;
      }
      try {
        const checkLimitCondtion = this.queryString.includes('.limit');
        if (checkLimitCondtion) {
          this.handleDataOperation(this.queryString);
        } else {
          alert('Please add a limit in your query, max 100 records');
        }
      } catch (err) {
        this.showLoader = false;
        this.queryString = 'this.db';
        alert(err);
      }
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

  checkTheInputQuery(inputQuery) {
    const inputquery = inputQuery;
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableBody.filter = filterValue.trim().toLowerCase();
    if (this.tableBody.paginator) {
      this.tableBody.paginator.firstPage();
    }
  }

  inputChange(event) {
    console.log(event, 'evn');
    this.tableBody = filtreArrayWithNestedObject(this.searchArray, event, 0);
    console.log(this.tableBody, 'evn');
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
      console.log(this.dataListWithOriginalStructure, 'dataListWithOriginalStructure-before');

      this.originalData = [...data];
      const resultArray = this.handleDataStructureWithNextedObject(data);
      this.resultArrayAfterStructure = [...resultArray];
      this.tableheader = this.getObjectUniqueKeys(resultArray);
      console.log(this.tableheader, 'tableheader');
      console.log(resultArray, 'resultArray');
      console.log(this.dataListWithOriginalStructure, 'dataListWithOriginalStructure');


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

  setDate(seconds) {
    return new Date(seconds * 1000);
  }

  typeOf(value) {
    return typeof value;
  }

  typeOfArray(isArray) {
    return Array.isArray(isArray);
  }

  reset() {
    this.searchString = '';
    this.tableheader = [];
    this.newKeysOfobject = [];
    this.originalData = [];
    this.dataListWithOriginalStructure = [];
  }

  clearData() {
    this.queryString = "this.db.collection('')";
    this.tableheader = [];
    this.originalData = [];
    this.searchString = '';
    this.dataFound = false;
  }

  saveQueryData() {
    const dialogRef = this.dialog.open(QueryTitleComponent, {
      width: '450px',
      data: { modalTitle: 'Enter Your Query Title', isSaveQuery: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result, 'The dialog was closed');
      if (result) {
        this.queryTitle = result;
        const currentDate = new Date();
        this.saveQueryToFirebase(this.queryTitle, this.queryString, currentDate, this.fireBaseAdminDocId);
      }
    });
  }
  //
  getCreatedDate(dateObj) {
    if (dateObj && dateObj.seconds) {
      const newDate = new Date(dateObj.seconds * 1000).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      return new Date(newDate).toDateString();

    } else {
      const newDate = new Date(dateObj).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      return new Date(newDate).toDateString();
    }
  }

  trackByIndex(i) { return i; }

  selectRow(data) {
    if (data.id !== this.selectedRowIndex) {
      this.selectedRowIndex = data.id;
      this.selectedRow = data;
    } else {
      this.selectedRowIndex = null;
    }

  }

  saveQueryToFirebase(title, query, currentDate, id) {
    return this.db
      .collection('avadutha_admin_pannel').doc(id).collection('firebasequery')
      .add({ title, query, createdDate: currentDate }).then((ref) => {
        ref.update({
          id: ref.id
        });
        console.log('saved');
        this.querylist.unshift({ id: ref.id, title, query, createdDate: currentDate });
        this.filtredQuerylist = [...this.querylist];
        this.snackBar.open('Saved Sucessfully', '', {
          duration: 2000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
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

  deleteQuery(query) {
    this.db.collection('avadutha_admin_pannel').doc(this.fireBaseAdminDocId).collection('firebasequery')
      .doc(query.id).delete().then(() => {
        console.log('deleted');
        this.querylist = this.querylist.filter((item) => item.id !== query.id);
        this.filtredQuerylist = [...this.querylist];
        this.snackBar.open('Deleted Sucessfully', '', {
          duration: 2000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      });
  }

  selectQuery(query) {
    this.selectedQuery = query.title;
    this.queryString = query.query;
    this.getData();
  }

  copyQuery(query) {
    this.queryString = query.query;
  }

  viewDetails() {
    if (this.selectedRow) {
      const filtredData = this.dataListWithOriginalStructure.filter((it) => it.ref && it.ref.id === this.selectedRow.ref.id);
      if (filtredData.length) {
        const viewData = {
          selectedRow: this.selectedRow,
          originalDataObj: filtredData[0]
        };
        this.dataService.setCurrentFirebaseCollectionData(viewData);
      }
      const tabledata = {
        resultArrayAfterDataStructure: this.resultArrayAfterStructure,
        mode: 'view',
        originalDataStructrure: this.dataListWithOriginalStructure,
        query: this.queryString
      };
      this.tableDataService.setCurrentTableData(tabledata);
      this.router.navigate(['/view-data']);
    }
  }

  goToDeletePage() {
    if (this.selectedRow) {
      this.dataService.setCurrentFirebaseCollectionData(this.selectedRow);
      const tabledata = {
        resultArrayAfterDataStructure: this.resultArrayAfterStructure,
        mode: 'delete',
        originalDataStructrure: this.dataListWithOriginalStructure,
        query: this.queryString
      };
      this.tableDataService.setCurrentTableData(tabledata);
      this.router.navigate(['/delete-page']);
    }
  }

  goToEditPage() {
    if (this.selectedRow) {
      const filtredData = this.dataListWithOriginalStructure.filter((it) => it.ref && it.ref.id === this.selectedRow.ref.id);
      if (filtredData.length) {
        this.dataService.setCurrentFirebaseCollectionData(filtredData[0]);
        const tabledata = {
          resultArrayAfterDataStructure: this.resultArrayAfterStructure,
          mode: 'edit',
          originalDataStructrure: this.dataListWithOriginalStructure,
          query: this.queryString
        };
        this.tableDataService.setCurrentTableData(tabledata);
        this.router.navigate(['/edit-page']);
      }
    }
  }

  getObjectUniqueKeys(array) {
    const uniqueKeys = Object.keys(array.reduce((result, obj) => {
      return Object.assign(result, obj);
    }, {}));

    return uniqueKeys.sort();

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


  searchQuery(value) {
    this.querylist = filtreArrayWithNestedObject(this.filtredQuerylist, value, 0);
    console.log('search vaue', this.querylist);
  }

  setTableDataToService(data, query) {
    const tableData = {
      data,
      query
    };
    this.tableDataService.setCurrentTableData(tableData);
  }


  getTableDataToService() {
    this.tableDataService.getCurrentTableData().subscribe((resultList) => {
      console.log(resultList, 'table-data');
      if (resultList) {
        this.dataFound = true;
        this.originalData = resultList.originalDataStructrure ? resultList.originalDataStructrure : [];
        this.resultArrayAfterStructure = resultList.resultArrayAfterDataStructure ? resultList.resultArrayAfterDataStructure : [];
        this.dataListWithOriginalStructure = resultList.originalDataStructrure ? resultList.originalDataStructrure : [];
        this.queryString = resultList.query;
        if (this.resultArrayAfterStructure) {
          this.tableheader = this.getObjectUniqueKeys(this.resultArrayAfterStructure);
          // to remove ref in header
          if (this.tableheader) {
            const index = this.tableheader.indexOf('ref');
            if (index > -1) {
              this.tableheader.splice(index, 1);
            }
          }
          this.tableBody = new MatTableDataSource([...this.resultArrayAfterStructure]);
          console.log(this.tableBody, 'tanlebody');
          setInterval(() => {
            this.tableBody.paginator = this.paginator;
            this.tableBody.sort = this.sort;
          }, 100);
        }
      }
    });
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
    this.excelService.exportAsExcelFile(finalResult, 'data');
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
            result[key] = new Date(item[key].seconds * 1000);
          } else {
            result[key] = item[key];
          }
        }
      });
      finalResult.push(result);
    });
    console.log(finalResult, 'finalResult');
    return finalResult;
  }

  closeBtn() {
    this.selectedRowIndex = null;
  }


  logout() {
    firebase.auth().signOut().then(() => {
      console.log('logout');
      this.router.navigate(['/login']);
    }).catch((err) => {
      alert(err);
    });
  }

}
