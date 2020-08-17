import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/filter';
import { Observable, Subject, of } from 'rxjs';
import { map, takeUntil, switchMap } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';


declare const jQuery: any;
declare const $;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-header',
  templateUrl: 'app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  @ViewChild('myModal') myModal: ElementRef;
  elementos: any[] = [];
  currentChoice: string;
  name$: any;
  codigo: any;
  message;
  mensaje: any;
  transferencia: any;
  super: boolean;
  sede: any;
  misede: any;
  miproyecto: any;
  foto: any;
  documentos$: Observable<any>;
  directorio$: Observable<any>;
  constructor(
    public auth: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    public router: Router,
    public route: ActivatedRoute,
  ) {

    this.super = true;
  }

  sub;
  ngOnInit() {
    this.directorio$ = this.afs.collection(`Directorio`).valueChanges();
    this.sub = this.afAuth.authState.pipe(switchMap(data => {
      if (data) {
        this.name$ = data.displayName;
        this.foto = data.photoURL;
        return this.afs.doc(`usuarios/${data.uid}`).valueChanges().pipe(map((m: any) => {
          this.super = m.roles.super;
        }));
      } else {
        return of(null);
      }
    })).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  signOut() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  limpiar() {

  }


  async goDocumento() {
    const { uid } = await this.auth.getUser();
    this.afs.doc(`usuarios/${uid}`).valueChanges().pipe(map((data: any) => {
      if (data) {
        const proyecto = data.proyecto;
        const sede = data.sede;
        return this.router.navigate(['/proyecto', proyecto.id, 'sede', sede.id, 'documentos']);
      } else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
  }

  async goUsuarios() {
    const { uid } = await this.auth.getUser();
    this.afs.doc(`usuarios/${uid}`).valueChanges().pipe(map((data: any) => {
      if (data) {
        const proyecto = data.proyecto;
        const sede = data.sede;
        return this.router.navigate(['/proyecto', proyecto.id, 'sede',  sede.id, 'usuarios']);
      } else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
  }

  listado() {
    // jQuery(this.myModal.nativeElement).modal('show');
  }

  async goReporte() {
    const { uid } = await this.auth.getUser();
    this.afs.doc(`usuarios/${uid}`).valueChanges().pipe(map((data: any) => {
      if (data) {
        const proyecto = data.proyecto;
        const sede = data.sede;
        return this.router.navigate(['/proyecto', proyecto.id, 'sede',  sede.id, 'usuarios', uid]);
      } else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
  }


}
