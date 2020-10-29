import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, map, first, take } from 'rxjs/operators';
import { User } from './user';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth, firestore } from 'firebase/app';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authenticated$: Observable<boolean>;
  user$: Observable<any>;

  constructor(private afs: AngularFirestore, public afAuth: AngularFireAuth) {
    this.authenticated$ = afAuth.authState.pipe(map(user => !!user));
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc(`usuarios/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      }));
  }

  async resetPassword(email: string): Promise<void> {
    try {
      return this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.log('Error->', error);
    }
  }

  async register(usuario: any, proyecto: any, sede: any): Promise<any> {
    try {
      const { user } = await this.afAuth.createUserWithEmailAndPassword(usuario.email, usuario.password);
      await this.createUserData(user, usuario, proyecto, sede);
      await this.sendVerifcationEmail();
      return user;
    } catch (error) {
      console.log('Error->', error);
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const { user } = await this.afAuth.signInWithEmailAndPassword(email, password);
      return user;
    } catch (error) {
      console.log('Error->', error);
      return false;
    }
  }

  async sendVerifcationEmail(): Promise<void> {
    try {
      return (await this.afAuth.currentUser).sendEmailVerification();
    } catch (error) {
      console.log('Error->', error);
    }
  }

  isEmailVerified(user: any): boolean {
    return user.emailVerified === true ? true : false;
  }

  getUser() {
    return this.user$.pipe(take(1)).toPromise();
  }

  async signOut() {
    await this.afAuth.signOut();
  }

  private async createUserData(user, usuario, proyecto, sede) {
    const usuarioRef: AngularFirestoreDocument<any> = this.afs.doc(`usuarios/${user.uid}`);
    const data: any = {
      photoURL: user.photoURL,
      lastSesion: Date.now(),
      uid: user.uid,
      displayName: usuario.displayName,
      email: usuario.email,
      estado: true,
      proyecto: {
        id: usuario.proyecto,
        nombre: proyecto
      },
      sede: {
        id: usuario.sede,
        nombre: sede
      },
      roles: {
        subscriber: true,
        editor: false,
        admin: false,
        super: false
      }
    };
    await this.afs.doc(`Proyecto/${usuario.proyecto}`).update({
      usuarios: firestore.FieldValue.arrayUnion({
        uid: user.uid, displayName: usuario.displayName,
        proyecto: data.proyecto, sede: data.sede, admin: false
      })
    });
    await this.afs.doc(`Sede/${usuario.sede}`).update({
      usuarios: firestore.FieldValue.arrayUnion({
        uid: user.uid, displayName: usuario.displayName,
        sede: data.sede
      })
    });
    return usuarioRef.set(data);
  }

  ///// Role-based Authorization /////

  canRead(user: User): boolean {
    const allowed = ['admin', 'editor', 'subscriber', 'super'];
    return this.checkAuthorization(user, allowed);
  }

  canEdit(user: User): boolean {
    const allowed = ['admin', 'editor', 'super'];
    return this.checkAuthorization(user, allowed);
  }

  canDelete(user: User): boolean {
    const allowed = ['admin', 'super'];
    return this.checkAuthorization(user, allowed);
  }

  canSuper(user: User): boolean {
    const allowed = ['super'];
    return this.checkAuthorization(user, allowed);
  }

  private checkAuthorization(user: User, allowedRoles: string[]): boolean {
    // tslint:disable-next-line:curly
    if (!user) return false;
    for (const role of allowedRoles) {
      if (user.roles[role]) {
        return true;
      }
    }
    return false;
  }
}


