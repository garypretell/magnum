
import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { observable, Observable, combineLatest, of, merge } from 'rxjs';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '../auth/auth.service';
import { map, switchMap, catchError, take } from 'rxjs/operators';
import { firestore } from 'firebase/app';
import { Router } from '@angular/router';
import 'rxjs/add/operator/catch';

@Injectable({
    providedIn: 'root'
  })
export class ChatService {
  private itemsCollection: AngularFirestoreCollection<any>;
  public chats: any[] = [];
  chats$: Observable<any>;
  usuario: any = {};
  recibeMensaje: string;
  public miusuario: any = {};
  usuarios$: Observable<any>;
  room: any;
  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth, private auth: AuthService, private router: Router) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
      this.usuario.nombre = user.displayName;
      this.usuario.uid = user.uid;
      }
    });

  }

  get(chatId) {
    return this.afs
      .collection<any>('chats')
      .doc(chatId)
      .valueChanges();
  }

  joinUsers(chat$: Observable<any>) {
    let chat;
    const joinKeys = {};

    return chat$.pipe(
      switchMap(c => {
        // Unique User IDs
        chat = c;
        const uids = Array.from(new Set(c.messages.map(v => v.uid)));

        // Firestore User Doc Reads
        const userDocs = uids.map(u =>
          this.afs.doc(`usuarios/${u}`).valueChanges()
        );

        return userDocs.length ? combineLatest(userDocs) : of([]);
      }),
      map(arr => {
        // tslint:disable-next-line:no-angle-bracket-type-assertion
        arr.forEach(v => (joinKeys[(<any> v).uid] = v));
        chat.messages = chat.messages.map(v => {
          return { ...v, user: joinKeys[v.uid] };
        });

        return chat;
      }),
      catchError((e) => {
        alert('creando conexión segura...');
        const dato = {
           uid : this.room,
           createdAt: Date.now(),
           count: 0,
           messages: []
         };
        this.afs.doc(`chats/${this.room}`).set(dato);
        this.router.navigate(['Chat']);
        return of(null);
     })
    );
  }

  async conectar(recibeMensaje) {
    const user1 = this.usuario.uid;
    const user2 = recibeMensaje;
    this.recibeMensaje = recibeMensaje;
    this.room =  (user1 < user2 ? user1 +  user2 : user2 +  user1);
    const recibe = 'recibe_' + user1;

    this.afs.collection(`mensajes`, ref => ref.where('chatId', '==', this.room)
    .where('recibe', '==', user1).where('estado', '==', recibe)).valueChanges({idField: 'id' }).take(1).pipe(map(m => {
      m.map((data: any) => {
       this.afs.doc(`mensajes/${data.id}`).update({estado: 'leido'});
      });
    })).subscribe();

    this.afs.collection(`chats`, ref => ref.where('uid', '==', this.room)).valueChanges().take(1).pipe(map(m => {
      if (m.length > 0){
        return this.router.navigate(['chats', this.room]);
      }else {
        const dato = {
          uid : this.room,
          createdAt: Date.now(),
          count: 0,
          messages: []
        };
        this.afs.doc(`chats/${this.room}`).set(dato).then(() => {
          return this.router.navigate(['chats', this.room]);
        });
      }
    })).subscribe();
  }

  async sendMessage(chatId, content) {
    const { uid } = await this.auth.getUser();
    this.recibeMensaje = chatId.replace(uid, '');
    const data = {
      uid,
      content,
      createdAt: Date.now()
    };

    if (uid) {
      const ref = this.afs.collection('chats').doc(chatId);
      return ref.update({
        messages: firestore.FieldValue.arrayUnion(data)
      }).then(() => {
        const mensaje: any = {
          chatId,
          uid,
          nombre: this.usuario.nombre,
          recibe: this.recibeMensaje,
          estado: 'recibe_' + this.recibeMensaje,
          mensaje: content,
          fecha: Date.now()
        };
        this.afs.collection(`mensajes`).add(mensaje);
      });
    }
  }

  async deleteMessage(chatId, chat, msg) {
    const { uid } = await this.auth.getUser();

    const ref = this.afs.collection('chats').doc(chatId);
    if (chat.uid === uid || msg.uid === uid) {
      // Allowed to delete
      delete msg.user;
      return ref.update({
        messages: firestore.FieldValue.arrayRemove(msg)
      });
    }
  }
}
