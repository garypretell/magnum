import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore, Query } from '@angular/fire/firestore';
import { FormBuilder } from '@angular/forms';

import Swal from 'sweetalert2';
import * as firebase from 'firebase/app';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { colorSets } from '@swimlane/ngx-charts';
import { ImprimirRegistroComponent } from '../libro/imprimir-registro/imprimir-registro.component';
import { AuthService } from 'app/auth/auth.service';
declare var jQuery: any;
declare const $;

@Component({
  selector: 'app-buscar-registro',
  templateUrl: './buscar-registro.component.html',
  styleUrls: ['./buscar-registro.component.css']
})
export class BuscarRegistroComponent implements OnInit, OnDestroy {
  @ViewChild(ImprimirRegistroComponent) childImprimir: ImprimirRegistroComponent;
  @ViewChild('myModalEditS') myModalEditS: ElementRef;
  private unsubscribe$ = new Subject();
  userFilterF: any = { estado: 'true' };
  searchObject: any = {};
  miproyecto: any;
  micodigo: any;
  misede: any;
  midocumento: any;
  proyecto: any;
  sede: any;
  documento: any;
  campos$: Observable<any>;
  registros$: any;
  p = 1;

  editObject: any = {};
  registrotoEdit: any = {};
  constructor(
    public auth: AuthService,
    public formBuilder: FormBuilder,
    public afs: AngularFirestore,
    public router: Router,
    private activatedroute: ActivatedRoute
  ) { }

  sub;
  ngOnInit() {
    this.sub = this.activatedroute.paramMap.subscribe(params => {
      this.miproyecto = params.get('p');
      this.misede = params.get('s');
      this.documento = params.get('d');
      this.midocumento = this.misede + '_' + this.documento;
      this.campos$ = this.afs.doc(`Plantillas/${this.midocumento}`).valueChanges();
    });

    this.afs.doc(`Proyecto/${this.miproyecto}`).valueChanges().pipe(switchMap((m: any) => {
      return this.afs.doc(`Sede/${this.misede}`).valueChanges().pipe(map((data: any) => {
        this.proyecto = { nombre: m.nombre, id: data.proyecto };
        this.sede = { nombre: data.nombre, id: data.sede };
      }));
    }), takeUntil(this.unsubscribe$)).subscribe();
    $('input:text:visible:first').focus();
  }

  search(obj) {
    this.campos$.pipe(switchMap(m => {
      if (m) {
        const valor = m.campos.filter(f => f.busqueda === true);
        const result = valor.map(a => a.nombre);
        const keys = Object.keys(this.searchObject);
        return this.afs.collection('Registros', ref => {
          let query: Query = ref;
          if (valor.length === 1) {
            query = query.where('documento', '==', this.documento)
              .where(result[0], '>=', obj[keys[0]]).where(result[0], '<=', obj[keys[0]]);
            // .orderBy(result[0])
            // .startAt(obj[keys[0]]).endAt(obj[keys[0]] + '\uf8ff');
          }
          if (valor.length === 2) {
            query = query.where('documento', '==', this.documento)
              .where(result[0], '==', obj[keys[0]])
              .orderBy(result[1])
              .startAt(obj[keys[1]]).endAt(obj[keys[1]] + '\uf8ff');
          }
          if (valor.length >= 3) {
            query = query.where('documento', '==', this.documento).where(result[0], '==', obj[keys[0]])
              .where(result[1], '==', obj[keys[1]]).where(result[2], '==', obj[keys[2]]);
          }
          return query;
        }).valueChanges({idField: 'id'}).pipe(map((data: any) => {
          this.registros$ = data;
        }
        ));
      } else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
  }

  keytab(event) {
    $('input').keydown(function(e) {
      if (e.which === 13) {
        const index = $('input').index(this) + 1;
        $('input').eq(index).focus();
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  printRegistro(data) {
    this.childImprimir.print();
  }

  seleccionar(data) {
    try {
      this.childImprimir.imprimirReg(data, this.misede, this.documento);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No existen un modelo de plantilla en el sistema, agregue uno!'
      });
    }
  }

  deleteRegistro(item) {
    Swal.fire({
      title: 'Esta seguro de eliminar este Registro?',
      // text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Eliminar!'
    }).then((result) => {
      if (result.value) {
        this.afs.doc(`Registros/${item.id}`).delete();
        Swal.fire(
          'Eliminado!',
          'El registro ha sido eliminado.',
          'success'
        );
      }
    });
   }

  enableEditing(event, item) {
    this.afs.doc(`Registros/${item.id}`).valueChanges().pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      this.registrotoEdit = data;
      this.editObject = data;
    });
    this.micodigo = item.id;
    jQuery(this.myModalEditS.nativeElement).modal('show');
  }

  updateRegistro() {
    this.afs.doc(`Registros/${this.micodigo}`).set(this.editObject, {merge: true});
    jQuery(this.myModalEditS.nativeElement).modal('hide');
  }

  goDocumentos() {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'documentos']);
  }

  goSede() {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede]);
  }

  

}
