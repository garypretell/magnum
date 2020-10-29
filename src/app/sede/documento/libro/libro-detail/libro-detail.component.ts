import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subject } from 'rxjs';
import { switchMap, map, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ImprimirRegistroComponent } from '../imprimir-registro/imprimir-registro.component';
import { AuthService } from 'app/auth/auth.service';
import { SedeService } from 'app/sede/sede.service';
declare var jQuery: any;
declare const $;
@Component({
  selector: 'app-libro-detail',
  templateUrl: './libro-detail.component.html',
  styleUrls: ['./libro-detail.component.css']
})
export class LibroDetailComponent implements OnInit, OnDestroy {
  @ViewChild(ImprimirRegistroComponent) childImprimir: ImprimirRegistroComponent;
  @ViewChild('myModalEditS') myModalEditS: ElementRef;
  private unsubscribe$ = new Subject();
  searchObject: any = {};
  userFilterF: any = { estado: 'true' };
  userFilterV: any = { visible: 'true' };
  newObject: any = {};
  editObject: any = {};
  miproyecto: any;
  proyecto: any;
  misede: any;
  sede: any;
  documento: any;
  midocumento: any;
  milibro: any;
  miruta: any;
  p = 1;
  rutaImg;
  campos$: Observable<any>;
  registros$: Observable<any>;
  micodigo: any;
  constructor(
    public auth: AuthService,
    public router: Router,
    private afs: AngularFirestore,
    private activatedroute: ActivatedRoute,
    public sedeService: SedeService
  ) { }

  sub;
  ngOnInit() {
    this.sub = this.activatedroute.paramMap.pipe(map(params => {
      this.miproyecto = params.get('p');
      this.misede = params.get('s');
      this.documento = params.get('d');
      this.midocumento = this.miproyecto + '_' + this.documento;
      this.milibro = params.get('l');
      this.miruta = this.midocumento + '_' + this.milibro;
      this.rutaImg = this.misede + '_' + params.get('d').replace(/ /g, '') + '_' + this.milibro;
      this.verifyData(this.rutaImg);
      this.campos$ = this.afs.doc(`Plantillas/${this.midocumento}`).valueChanges();
      this.registros$ = this.afs.collection(`Registros`, ref => ref.where('sede.id', '==', this.misede)
        .where('documento', '==', this.documento).where('libro', '==', parseFloat(this.milibro)).orderBy('mifecha', 'desc'))
        .valueChanges({ idField: 'id' });
    })).subscribe();

    this.afs.doc(`Proyecto/${this.miproyecto}`).valueChanges().pipe(switchMap((m: any) => {
      return this.afs.doc(`Sede/${this.misede}`).valueChanges().pipe(map((data: any) => {
        this.proyecto = { nombre: m.nombre, id: data.proyecto };
        this.sede = { nombre: data.nombre, id: data.sede };
      }));
    }), takeUntil(this.unsubscribe$)).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  verifyData(libro) {
    this.afs.firestore.doc(`Libros/${libro}`).get()
      .then(docSnapshot => {
        if (!docSnapshot.exists) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'This Book has not been registered!'
          });
          this.goLibro();
        }
      });
  }

  goHome() {
    this.router.navigate(['/Home']);
  }

  goDocumento() {
    this.router.navigate(['/proyecto', this.miproyecto, 'documents']);
  }

  goLibro() {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'documentos', this.documento, 'libros']);
  }

  keytab(event) {
    $('input').keydown(function(e) {
      if (e.which === 13) {
        const index = $('input').index(this) + 1;
        $('input').eq(index).focus();
      }
    });
  }

  enableEditing($event, item) {
    this.afs.doc(`Registros/${item.id}`).valueChanges().pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      this.editObject = data;
    });
    this.micodigo = item.id;
    jQuery(this.myModalEditS.nativeElement).modal('show');
  }

  updateRegistroS() {
    this.afs.doc(`Registros/${this.micodigo}`).set(this.editObject, { merge: true });
    jQuery(this.myModalEditS.nativeElement).modal('hide');
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
        text: 'There is no template model in the system, add one!'
      });
    }
  }

  deleteRegistro(registro) {
    Swal.fire({
      title: 'Are you sure to delete this Record?',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete!'
    }).then((result) => {
      if (result.value) {
        this.afs.doc(`Registros/${registro.id}`).delete();
        Swal.fire(
          'Deleted!',
          'Record has been deleted.',
          'success'
        );
      }
    });
  }

  printLibro() {}
}
