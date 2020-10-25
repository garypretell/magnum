import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Observable, of } from 'rxjs';
import { switchMap, map, takeUntil, take, first } from 'rxjs/operators';
import Swal from 'sweetalert2';
import * as firebase from 'firebase/app';
import { AuthService } from 'app/auth/auth.service';
import { ElectronService } from 'app/core/services';
declare var jQuery: any;
declare const $;

@Component({
  selector: 'app-libro-registrar',
  templateUrl: './libro-registrar.component.html',
  styleUrls: ['./libro-registrar.component.css']
})
export class LibroRegistrarComponent implements OnInit, OnDestroy {
  @ViewChild('myModalEditS') myModalEditS: ElementRef;
  private unsubscribe$ = new Subject();
  newObject: any = {};
  editObject: any = {};
  registrotoEdit: any = {};
  userFilterF: any = { estado: 'true' };
  userFilterV: any = { visible: 'true' };
  p: any;
  miproyecto: any;
  micodigo: any;
  misede: any;
  midocumento: any;
  documento: any;
  milibro: any;
  miruta: any;
  registros$: Observable<any>;
  campos$: Observable<any>;
  proyecto: any;
  sede: any;
  rutaImg: any;
  objImg: any;
  indx: any;
  midata: any;
  listado: boolean;
  image: any;
  constructor(
    public auth: AuthService,
    public formBuilder: FormBuilder,
    public afs: AngularFirestore,
    public router: Router,
    private activatedroute: ActivatedRoute,
    private electronService: ElectronService,
  ) {
  }

  sub;
  ngOnInit() {
    this.sub = this.activatedroute.paramMap.subscribe(params => {
      this.miproyecto = params.get('p');
      this.misede = params.get('s');
      this.documento = params.get('d');
      this.midocumento = this.miproyecto + '_' + this.documento;
      this.milibro = params.get('l');
      this.miruta = this.midocumento + '_' + this.milibro;
      this.rutaImg = this.miproyecto + '_' + params.get('d').replace(/ /g, '') + '_' + this.milibro;
      this.actualizarData(this.miruta);
      this.campos$ = this.afs.doc(`Plantillas/${this.midocumento}`).valueChanges();
      this.registros$ = this.afs.collection(`Registros`, ref => ref.where('sede.id', '==', this.misede)
        .where('documento', '==', this.documento).where('libro', '==', parseFloat(this.milibro)).orderBy('mifecha', 'desc').limit(6))
        .valueChanges({ idField: 'id' });
    });

    this.afs.doc(`Proyecto/${this.miproyecto}`).valueChanges().pipe(switchMap((m: any) => {
      return this.afs.doc(`Sede/${this.misede}`).valueChanges().pipe(map((data: any) => {
        this.proyecto = { nombre: m.nombre, id: data.proyecto };
        this.sede = { nombre: data.nombre, id: data.sede };
      }));
    }), takeUntil(this.unsubscribe$)).subscribe();
    $('input:text:visible:first').focus();

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  actualizarData(libro) {
    this.afs.firestore.doc(`Libros/${libro}`).get()
      .then(docSnapshot => {
        if (!docSnapshot.exists) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Este Libro no ha sido registrado!'
          });
          this.goLibro();
        }
      }
      );
  }

  goLibro() {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'documentos', this.documento, 'libros']);
  }

  deleteRegistro(registro) {
    Swal.fire({
      title: 'Are you sure to delete this Record?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete!'
    }).then((result) => {
      if (result.value) {
        this.afs.doc(`Registros/${registro.id}`).delete();
        const rutaDoc = this.misede + '_' + this.documento;
        const value = { value: firebase.firestore.FieldValue.increment(-1) };
        const datos = { contador: firebase.firestore.FieldValue.increment(-1) };
        this.afs.doc(`Documentos/${rutaDoc}`).set(value, { merge: true });
        this.afs.doc(`Libros/${this.miruta}`).set(datos, { merge: true });
        Swal.fire(
          'Deleted!',
          'Record has been eliminated.',
          'success'
        );
      }
    });
  }

  enableEditing($event, item) {
    this.afs.doc(`Registros/${item.id}`).valueChanges().pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      this.registrotoEdit = data;
      this.editObject = data;
    });
    this.micodigo = item.id;
    jQuery(this.myModalEditS.nativeElement).modal('show');
  }

  updateRegistroS(registrotoEdit) {
    this.afs.doc(`Registros/${this.micodigo}`).set(this.editObject, { merge: true });
    jQuery(this.myModalEditS.nativeElement).modal('hide');
  }

  goListado() {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'documentos',
      this.documento, 'libros', this.milibro]);
  }

  add(registro) {
    try {
      registro.path = 'sin imagen';
      registro.libro = parseFloat(this.milibro);
      registro.createdAt = Date.parse(new Date().toISOString().substring(0, 10));
      registro.mifecha = Date.parse(new Date().toISOString());
      registro.usuarioid = firebase.auth().currentUser.uid;
      registro.proyecto = this.proyecto;
      registro.sede = this.sede;
      registro.documento = this.documento;

      this.afs.collection(`Registros`).add(registro);
      const datos = { contador: firebase.firestore.FieldValue.increment(1) };
      const rutaDoc = this.miproyecto + '_' + this.documento;
      const value = { value: firebase.firestore.FieldValue.increment(1) };
      this.afs.doc(`Documentos/${rutaDoc}`).set(value, { merge: true });
      this.afs.doc(`Proyecto/${this.proyecto.id}`).set(value, { merge: true });
      this.afs.doc(`Libros/${this.miruta}`).set(datos, { merge: true });
      this.newObject = {};
      registro = null;
      // $('input:text:visible:first').focus();
      $('input:enabled:visible:first').focus();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'There was an unexpected error!'
      });
    }
  }

  keytab(event) {
    $('input').keydown(function(e) {
      if (e.which === 13) {
        const index = $('input').index(this) + 1;
        $('input').eq(index).focus();
      }
    });
  }

  goHome() {
    this.router.navigate(['/Home']);
  }

  goDocumento() {
    this.router.navigate(['/proyecto', this.miproyecto, 'documents']);
  }

  verListado() {
    this.listado = true;
  }

  verImagen() {
    this.listado = false;
  }
}
