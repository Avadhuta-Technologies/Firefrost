import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Firebase Modules
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { QueryTitleComponent } from './comp/query-title/query-title.component';
import { HomeComponent } from './comp/home/home.component';
import { PagenotfoundComponent } from './comp/pagenotfound/pagenotfound.component';
import { EditcollectiondataComponent } from './comp/editcollectiondata/editcollectiondata.component';
import { DeletecollectiondataComponent } from './comp/deletecollectiondata/deletecollectiondata.component';
import { ViewecollectiondataComponent } from './comp/viewecollectiondata/viewecollectiondata.component';
import { CustommodalComponent } from './comp/custommodal/custommodal.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { LoginComponent } from './comp/login/login.component';
import { DashboardComponent } from './comp/dashboard/dashboard.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatBottomSheetModule, MAT_BOTTOM_SHEET_DEFAULT_OPTIONS } from '@angular/material/bottom-sheet';
import { UserManagementComponent } from './comp/user-management/user-management.component';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';



@NgModule({
  declarations: [
    AppComponent,
    QueryTitleComponent,
    HomeComponent,
    PagenotfoundComponent,
    EditcollectiondataComponent,
    DeletecollectiondataComponent,
    ViewecollectiondataComponent,
    CustommodalComponent,
    LoginComponent,
    DashboardComponent,
    UserManagementComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
    AppRoutingModule,
    MatToolbarModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatBottomSheetModule,
    MatSelectModule,
    MatRadioModule,

  ],
  providers: [],
  entryComponents: [QueryTitleComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
