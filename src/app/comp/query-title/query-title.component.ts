import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-query-title',
  templateUrl: './query-title.component.html',
  styleUrls: ['./query-title.component.scss']
})
export class QueryTitleComponent implements OnInit {
  title: string;
  modalTitle;
  inputQuerys = [];
  inputKeys = {};
  isSaveQuery: boolean;
  constructor(
    public dialogRef: MatDialogRef<QueryTitleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    if (this.data) {
      console.log(this.data, 'inputQuerys');
      this.modalTitle = this.data.modalTitle;
      this.isSaveQuery = this.data.isSaveQuery;
      if (this.data.inputquery) {
        this.inputQuerys = this.data.inputquery;
        console.log(this.inputQuerys, 'checkTheInputQuery');
        if (this.inputQuerys.length) {
          this.inputQuerys.map((item) => {
            this.inputKeys[item] = '';
          });
        }
      }
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  changeInput(event, input) {
    this.inputKeys[input] = event;
  }
}
