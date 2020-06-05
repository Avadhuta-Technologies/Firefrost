import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-custommodal',
  templateUrl: './custommodal.component.html',
  styleUrls: ['./custommodal.component.scss']
})
export class CustommodalComponent implements OnInit {
  currentData;
  title: string;
  constructor(public dialogRef: MatDialogRef<CustommodalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
  ngOnInit(): void {
    if (this.data) {
      this.currentData = this.data;
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
