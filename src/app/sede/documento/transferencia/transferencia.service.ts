import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { map, switchMap, take } from 'rxjs/operators';
import {  BehaviorSubject } from 'rxjs';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as firebase from 'firebase/app';
import '@firebase/messaging';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable({
  providedIn: 'root'
})
export class TransferenciaService {
  private messaging = firebase.messaging();

  public messageSource = new Subject();
  currentMessage = this.messageSource.asObservable();

  constructor(public afs: AngularFirestore,  public afAuth: AngularFireAuth,
              private afMessaging: AngularFireMessaging) {

  }


  getPermission(user) {
    this.messaging.requestPermission()
    .then(() => {
      console.log('Notification permission granted.');
      return this.messaging.getToken();
    })
    .then(token => {
      const tokenRef = this.afs.collection('usuarios').doc(user.uid);
      const tokens = { token };
      tokenRef.set( tokens, { merge: true});
      this.saveToken(user, token);
    })
    .catch((err) => {
      console.log('Unable to get permission to notify.', err);
    });
  }


  // Listen for token refresh
  monitorRefresh(user) {
    this.messaging.onTokenRefresh(() => {
      this.messaging.getToken()
      .then(refreshedToken => {
        console.log('Token refreshed.');
        this.saveToken(user, refreshedToken);
      })
      .catch( err => console.log(err, 'Unable to retrieve new token') );
    });
  }


  // used to show message when app is open
  receiveMessages() {
    this.messaging.onMessage(payload => {
     // console.log('Message received. ', payload);
     this.messageSource.next(payload);
   });

  }

  // save the permission token in firestore
  private saveToken(user, token): void {
      const currentTokens = user.fcmTokens || { };
      // If token does not exist in firestore, update db
      if (!currentTokens[token]) {
        const userRef = this.afs.collection('usuarios').doc(user.uid);
        const tokens = { ...currentTokens, [token]: true };
        userRef.update({ fcmTokens: tokens });
      }
  }

}
