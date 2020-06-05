import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../service/user.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string;
  password: string;
  db = firebase.firestore();
  showLoader = false;
  name = "";
  fireBaseAdminDocId: string = '';
  constructor(public router: Router, private snackBar: MatSnackBar, private userService: UserService) { }

  ngOnInit(): void {
    this.getFireBaseAdminPannelId();
  }

  //avadutha_admin_created
  login() {
    this.showLoader = true;
    this.emailLogin(this.email, this.password)
      .then((user) => {
        if (user) {
          console.log(user, 'user');
          if (!this.fireBaseAdminDocId || this.fireBaseAdminDocId === '') {
            this.isAdminCreated();
          } else {
            this.checkRoleInFireBaseCollection(this.email, this.fireBaseAdminDocId);
          }
        }
      }, (err) => {
        this.showLoader = false;
        console.log(err, 'err');
        alert(err);
      }).catch((err) => {
        this.showLoader = false;
        alert(err);
      });
  }


  getFireBaseAdminPannelId() {
    const savedQuery = this.db.collection('avadutha_admin_pannel').get();
    const data = [];
    savedQuery.then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      console.log(data, 'data');
      if (data.length) {
        this.fireBaseAdminDocId = data[0].id;
      } else {
        this.fireBaseAdminDocId = '';
      }
      console.log(this.fireBaseAdminDocId, 'this.fireBaseAdminDocId');
    });
  }

  emailLogin(email: string, password: string): Promise<any> {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  checkRoleInFireBaseCollection(email, id) {
    this.showLoader = true;
    const data = [];
    let savedQuery;
    if (id) {
      savedQuery = this.db.collection('avadutha_admin_pannel')
        .doc(id).collection('auth').where('email', '==', email).get();
      savedQuery.then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          data.push(doc.data());
        });
        if (data.length) {
          console.log(data, 'data');
          this.snackBar.open('Sucessfully Login', '', {
            duration: 2000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom'
          });
          this.routeBasedOnRole(data[0].role);
          this.showLoader = false;
          this.userService.setCurrentUserData(data[0]);
        } else {
          alert('Please contact your admin since you dont have access');
          this.showLoader = false;
        }
      }, (err) => {
        console.log(err, 'err');
        this.showLoader = false;
        alert(err)
      }).catch((err) => {
        this.showLoader = false;
        alert(err);
        console.log(err, 'alert-err');
      });
    } else {
      alert('smt went wrong');
    }

  }

  logout() {
    firebase.auth().signOut().then(() => {
      console.log('logout');
    }).catch((err) => {
      console.log(err, 'er');
    });
  }

  routeBasedOnRole(role) {
    if (role === 'user') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/query-page']);
    }
  }

  isAdminCreated() {
    this.showLoader = true;
    const savedQuery = this.db.collection('avadutha_admin_pannel').get();
    const data = [];
    savedQuery.then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      console.log(data, 'data');
      if (!data.length) {
        this.createAdminIsCreated();
      } else {
        alert('smtg went wrong');
      }
    }, (err) => {
      this.showLoader = false;
      alert(err);
    }).catch((er) => {
      this.showLoader = false;
      alert(er);
    })
  }

  createAdminIsCreated() {
    const savedQuery = this.db.collection('avadutha_admin_pannel');
    savedQuery.add({ avadutha_admin_created: true }).then((ref) => {
      console.log(ref, 'created');
      if (ref) {
        ref.update({
          id: ref.id
        });
        this.createAdminUser(ref.id);
      }
    });
  }

  createAdminUser(id) {
    const email = this.email;
    const role = 'admin'
    const currentDate = new Date();
    const isActive = true;
    const name = this.name;
    console.log(isActive, 'isActive');
    return this.db.collection('avadutha_admin_pannel')
      .doc(id)
      .collection('auth')
      .add({ email, isActive, role, createdDate: currentDate, name }).then((ref) => {
        ref.update({
          id: ref.id
        });
        this.snackBar.open('Created Admin SucessFully', '', {
          duration: 3000
        });
        this.checkRoleInFireBaseCollection(this.email, id);
      }, (err) => {
        console.log(err, 'err');
        alert(err);
      }).catch((e) => {
        console.log('Error getting documents: ', e);
        alert(e);
      });
  }

}