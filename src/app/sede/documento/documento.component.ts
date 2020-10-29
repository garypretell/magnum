import { Component, OnInit, OnDestroy, AfterViewInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { AuthService } from 'app/auth/auth.service';
declare var jQuery: any;
declare const $;

@Component({
  selector: 'app-documento',
  templateUrl: './documento.component.html',
  styleUrls: ['./documento.component.css']
})
export class DocumentoComponent implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {
  @ViewChild('myModal') myModal: ElementRef;
  sede$: Observable<any>;
  documentos$: Observable<any>;
  checkBoxValue: boolean;
  searchDoc: any = {};

  nameProject;
  miproyecto: any;
  misede: any;
  proyecto: any;
  sede: any;

  public addDocumentoForm: FormGroup;
  private unsubscribe$ = new Subject();
  view: any[];

  // options
  showDataLabel = true;
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'DOCUMENTS';
  showYAxisLabel = true;
  yAxisLabel = 'RECORDS';
  nombreGrafica: any;
  constructor(
    public formBuilder: FormBuilder,
    public auth: AuthService,
    public router: Router,
    private afs: AngularFirestore,
    private activatedroute: ActivatedRoute,
  ) {
    this.checkBoxValue = false;
    this.view = [innerWidth / 1.8, innerHeight / 1.5];
  }

  sub;
  ngOnInit() {
    this.sub = this.activatedroute.paramMap.pipe(map(params => {
      this.sede$ = this.afs.doc(`Sede/${params.get('s')}`).valueChanges();
      this.documentos$ = this.afs.collection('Documentos', ref => ref.where('sede', '==', params.get('s'))
        .orderBy('createdAt', 'desc')).valueChanges({ idField: 'ids' });
      this.miproyecto = params.get('p');
      this.misede = params.get('s');
    })).subscribe();

    this.afs.doc(`Proyecto/${this.miproyecto}`).valueChanges().pipe(switchMap((m: any) => {
      this.nameProject = m.proyecto.nombre;
      return this.afs.doc(`Sede/${this.misede}`).valueChanges().pipe(map((data: any) => {
        this.proyecto = { nombre: m.nombre, id: data.proyecto };
        this.sede = { nombre: data.nombre, id: data.sede };
      }));
    }), takeUntil(this.unsubscribe$)).subscribe();

    this.addDocumentoForm = this.formBuilder.group({
      nombre: ['', [Validators.required]]
    });
  }

  ngAfterViewChecked() {
    try {
    } catch (error) {
    }
    // $('[data-toggle="tooltip"]').tooltip();
  }

  ngAfterViewInit(): void {
    setTimeout(_ => {
      window.dispatchEvent(new Event('resize'));
    }); // BUGFIX:
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getColor(estado) {
    switch (estado) {
      case true:
        return 'black';
      case false:
        return 'red';
    }
  }

  showModal() {
    jQuery(this.myModal.nativeElement).modal('show');
  }

  addDocumento() {
    const documento: any = {
      id: (this.addDocumentoForm.value.nombre).replace(/ /g, ''),
      nombre: this.addDocumentoForm.value.nombre,
      name: this.addDocumentoForm.value.nombre,
      Libros: 0,
      principal: false,
      proyecto: this.miproyecto,
      sede: this.misede,
      plantilla: false,
      value: 0,
      createdAt: Date.now()
    };
    const ruta = this.misede + '_' + documento.id;
    const rutaProyecto = this.miproyecto + '_' + documento.id;
    this.afs.firestore.doc(`Documentos/${ruta}`).get()
      .then(docSnapshot => {
        if (docSnapshot.exists) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Este documento ya existe!',
          });
          this.addDocumentoForm.reset();
        } else {
          this.afs.doc(`Documentos/${ruta}`).set(documento);
          this.addDocumentoForm.reset();
          jQuery(this.myModal.nativeElement).modal('hide');
        }
      });
  }

  deleteDocumento(documento) {
    Swal.fire({
      title: 'Esta seguro de eliminar este Documento?',
      // text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Eliminar!'
    }).then((result) => {
      if (result.value) {
        this.afs.doc(`Documentos/${documento.ids}`).delete();
        Swal.fire(
          'Eliminado!',
          'El documento ha sido eliminado.',
          'success'
        );
      }
    });
  }

  onResize(event) {
    // this.view = [innerWidth / 2.0, 300];
    this.view = [event.target.innerWidth / 1.6, event.target.innerHeight / 1.6];
  }

  goPlantilla(documento) {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede,
      'documentos', documento.id, 'plantilla']);
  }

  goReporte() {
    this.auth.user$.pipe(map(m => {
      this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'usuarios', m.uid]);
    }), takeUntil(this.unsubscribe$)).subscribe();
  }

  backClicked() {
    this.router.navigate(['Home']);
  }

  goLibro(documento) {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'documentos', documento.id, 'libros']);
  }

  buscarDocumentos(documento) {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'documentos', documento.id, 'busqueda']);
  }

}
