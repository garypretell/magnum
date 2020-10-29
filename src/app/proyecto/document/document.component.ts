import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/auth/auth.service';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
declare var jQuery: any;
declare const $;

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('myModal') myModal: ElementRef;
  private unsubscribe$ = new Subject();
  public addDocumentoForm: FormGroup;
  documentos$: Observable<any>;
  miproyecto: any;
  searchDoc: any = {};
  nameProject;
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
    private activatedroute: ActivatedRoute
  ) {
    this.view = [innerWidth / 2.0, innerHeight / 2.2];
   }

  sub;
  ngOnInit(): void {
    this.sub = this.activatedroute.paramMap.pipe(map(params => {
      this.documentos$ = this.afs.collection('Documentos', ref => ref.where('proyecto', '==', params.get('p'))
        .orderBy('createdAt', 'desc')).valueChanges({ idField: 'ids' });
      this.miproyecto = params.get('p');
    })).subscribe();

    this.afs.doc(`Proyecto/${this.miproyecto}`).valueChanges().pipe(map((m: any) => {
      if(m){
        this.nameProject = m.name;
      }else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();

    this.addDocumentoForm = this.formBuilder.group({
      nombre: ['', [Validators.required]]
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit(): void {
    setTimeout(_ => {
      window.dispatchEvent(new Event('resize'));
    }); // BUGFIX:
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
      plantilla: false,
      value: 0,
      createdAt: Date.now()
    };
    const ruta = this.miproyecto + '_' + documento.id;
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
      title: 'Are you sure to delete this Document?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete!'
    }).then((result) => {
      if (result.value) {
        this.afs.doc(`Documentos/${documento.ids}`).delete();
        Swal.fire(
          'Deleted!',
          'Document has been deleted.',
          'success'
        );
      }
    });
  }

  onResize(event) {
    // this.view = [innerWidth / 2.0, 300];
    this.view = [event.target.innerWidth / 2.0, event.target.innerHeight /2.2];
  }

  async goPlantilla(documento) {
    const { uid } = await this.auth.getUser();
    this.afs.doc(`usuarios/${uid}`).valueChanges().pipe(map((data: any) => {
      if (data) {
        const proyecto = data.proyecto;
        const sede = data.sede;
        return this.router.navigate(['/proyecto', this.miproyecto, 'sede', sede.id, 'documentos', documento.id, 'plantilla']);
      } else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
  }

  async goReporte() {
    const { uid } = await this.auth.getUser();
    this.afs.doc(`usuarios/${uid}`).valueChanges().pipe(map((data: any) => {
      if (data) {
        const proyecto = data.proyecto;
        const sede = data.sede;
        return this.router.navigate(['/proyecto', this.miproyecto, 'sede', sede.id, 'usuarios', uid]);
      } else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
  }

  backClicked() {
    this.router.navigate(['Home']);
  }

  async goLibro(documento) {
    const { uid } = await this.auth.getUser();
    this.afs.doc(`usuarios/${uid}`).valueChanges().pipe(map((data: any) => {
      if (data) {
        const proyecto = data.proyecto;
        const sede = data.sede;
        return this.router.navigate(['/proyecto', this.miproyecto, 'sede', sede.id, 'documentos', documento.id, 'libros']);
      } else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
  }

  async buscarDocumentos(documento) {
    const { uid } = await this.auth.getUser();
    this.afs.doc(`usuarios/${uid}`).valueChanges().pipe(map((data: any) => {
      if (data) {
        const proyecto = data.proyecto;
        const sede = data.sede;
        return this.router.navigate(['/proyecto', this.miproyecto, 'sede', sede.id, 'documentos', documento.id, 'busqueda']);
      } else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
  }

}
