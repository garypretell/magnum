import { AuthService } from '../../auth/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { of, Observable, from, Subject } from 'rxjs';
import {
  map,
  switchMap,
  tap,
  flatMap,
  concatMap,
  take,
  debounceTime,
  takeUntil,
  mergeMap,
} from 'rxjs/operators';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';

import { Router } from '@angular/router';
// import { SedeService } from "src/app/sede/sede.service";
import { InicioService } from '../inicio.service';
import Swal from 'sweetalert2';
import { SedeService } from 'app/sede/sede.service';

declare let jQuery: any;
declare const $;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  isAdmin: boolean;
  @ViewChild('myToast') myToast: ElementRef;
  midata: Observable<any>;
  view: any;
  pedidosForm: FormGroup;
  p: 1;
  searchDoc: any = { nombre: '' };
  proyecto: any;
  sede: any;
  email: any;
  sede$: Observable<any>;
  displayName: any;
  constructor(
    public formBuilder: FormBuilder,
    private afs: AngularFirestore,
    public auth: AuthService,
    private router: Router,
    public inicioService: InicioService,
    public sedeService: SedeService
  )
  {
    this.view = [innerWidth / 1.5, 400];
    this.isAdmin = false;
  }

  sub;
  async ngOnInit() {
    this.pedidosForm = this.formBuilder.group({
      apellidos: ['', [Validators.required]],
      nombres: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      proyecto: ['', [Validators.required]],
      sede: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      estado: [''],
      fecha: [''],
    });

    const { uid } = await this.auth.getUser();
    this.sub = this.afs
      .doc(`usuarios/${uid}`)
      .valueChanges()
      .pipe(
        switchMap(async (data: any) => {
          if (data) {
            this.email = data.email;
            this.displayName = data.displayName;
            this.proyecto = data.proyecto;
            this.sede = data.sede;
            if (this.proyecto) {
              this.sede$ = await this.sedeService.getSede(this.proyecto.id);
              this.midata = this.afs
                .collection('Documentos', (ref) =>
                  ref
                    .where('proyecto', '==', this.proyecto.id)
                    .where('estado', '==', 'proyecto')
                )
                .valueChanges({ idField: 'ids' });
              this.midata = this.afs.collection('Documentos', ref => ref.where('sede', '==', this.sede.id)
                .orderBy('createdAt', 'desc')).valueChanges({ idField: 'ids' });
              return this.sede;
            }
          } else {
            return of(null);
          }
        }),
        switchMap((m: any) => {
          if (m) {
            return this.afs
              .doc(`Sede/${m.id}`)
              .valueChanges()
              .pipe(
                map((data: any) => {
                  this.isAdmin = data.principal;
                  this.inicioService.changeValue(data.principal);
                  return this.isAdmin;
                })
              );
          } else {
            return of(null);
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async administrar() {
    const { uid } = await this.auth.getUser();
    this.afs
      .doc(`usuarios/${uid}`)
      .valueChanges()
      .pipe(
        map((data: any) => {
          if (data) {
            const proyecto = data.proyecto;
            return this.router.navigate(['/proyecto', proyecto.id, 'sede']);
          } else {
            return of(null);
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  getColor(estado) {
    switch (estado) {
      case true:
        return 'green';
      case false:
        return 'black';
    }
  }

  showModal() {
    // jQuery(this.myModal.nativeElement).modal('show');
  }

  trackByFn(index, item) {
    return item.id;
  }

  onSelect(data) {
    // console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data) {
    // console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data) {
    // console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  onResize(event) {
    this.view = [event.target.innerWidth / 1.35, 400];
  }

  signOut() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  async goSede() {
    const { uid } = await this.auth.getUser();
    this.afs.doc(`usuarios/${uid}`).valueChanges().pipe(map((data: any) => {
      if (data) {
        const proyecto = data.proyecto;
        const sede = data.sede;
        return this.router.navigate(['/proyecto', proyecto.id, 'sede', sede.id]);
      } else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
  }

  alerta(): void { }

  showCodigo(sede) {
    Swal.fire({
      title: `CÓDIGOS DE ${sede.nombre}`,
      html: `<b class='mt-5'>PROYECTO: </b> <br/> ${sede.proyecto} <br/>
             <b>SEDE: </b> <br/>${sede.sede}
      `,
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
    });
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

  goLogin() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }
}
