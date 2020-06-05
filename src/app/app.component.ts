import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import { UserService } from './comp/service/user.service';
import * as config from 'src/firebase-config.json';
import { IfStmt } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  db;
  fireBaseAdminDocId;
  constructor(private router: Router,
    private userService: UserService) {
    const firebaseConfig = config['default'];
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      this.db = firebase.firestore();
    }
  }

  ngOnInit() {
    this.getFireBaseAdminPannelId();
  }

  checkUserLogin(id) {
    return firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log(user, 'curent-user');
        this.checkRoleInFireBaseCollection(user.email, id);
      } else {
        this.router.navigate(['/login']);
        console.log(user, 'not-user-sign-in-user');
      }
    });
  }

  routeBasedOnRole(role) {
    if (role && role === 'user') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/query-page']);
    }
  }

  checkRoleInFireBaseCollection(email, id) {
    const data = [];
    const savedQuery = this.db.collection('avadutha_admin_pannel')
      .doc(id)
      .collection('auth').where('email', '==', email).get();
    savedQuery.then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      console.log(data, 'data');
      if (data.length) {
        this.routeBasedOnRole(data[0].role);
        this.userService.setCurrentUserData(data[0]);
      } else {
        this.router.navigate(['/login']);
        alert('Not Authoized Please Contact Your Admin');
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
      console.log(data, 'data');
      if (data.length) {
        this.fireBaseAdminDocId = data[0].id;
        console.log(data, 'firebase-doc-id');
        this.checkUserLogin(this.fireBaseAdminDocId);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

}

