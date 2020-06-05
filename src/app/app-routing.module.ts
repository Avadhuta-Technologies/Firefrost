import { DashboardComponent } from './comp/dashboard/dashboard.component';
import { LoginComponent } from './comp/login/login.component';
import { ViewecollectiondataComponent } from './comp/viewecollectiondata/viewecollectiondata.component';
import { EditcollectiondataComponent } from './comp/editcollectiondata/editcollectiondata.component';
import { PagenotfoundComponent } from './comp/pagenotfound/pagenotfound.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './comp/home/home.component';
import { DeletecollectiondataComponent } from './comp/deletecollectiondata/deletecollectiondata.component';
import { UserManagementComponent } from './comp/user-management/user-management.component';

const routes: Routes = [
  { path: '', redirectTo: 'query-page', pathMatch: 'full' },
  { path: 'query-page', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'edit-page', component: EditcollectiondataComponent, },
  { path: 'view-data', component: ViewecollectiondataComponent, },
  { path: 'delete-page', component: DeletecollectiondataComponent, },
  { path: 'user-management', component: UserManagementComponent, },
  { path: '**', component: PagenotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
