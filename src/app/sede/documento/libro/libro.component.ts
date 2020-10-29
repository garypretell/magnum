import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewChecked } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { SedeService } from '../../sede.service';
import { Observable, Subject, of } from 'rxjs';
import { switchMap, map, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import * as firebase from 'firebase/app';
import { AuthService } from 'app/auth/auth.service';
declare const jQuery: any;
declare const $;

@Component({
  selector: 'app-libro',
  templateUrl: './libro.component.html',
  styleUrls: ['./libro.component.css']
})
export class LibroComponent implements OnInit, OnDestroy, AfterViewChecked {
  numLibro: any;
  message: any;
  private unsubscribe$ = new Subject();
  @ViewChild('addMLibro') addMLibro: ElementRef;
  @ViewChild('myToast') myToast: ElementRef;
  addLibroForm: FormGroup;

  miproyecto: any;
  proyecto: any;
  misede: any;
  sede: any;
  documento: any;
  midocumento: any;
  topList$: Observable<any>;
  tipoBusqueda: boolean;
  constructor(
    public auth: AuthService,
    public formBuilder: FormBuilder,
    public router: Router,
    private afs: AngularFirestore,
    private activatedroute: ActivatedRoute,
    public sedeService: SedeService
  ) { }

  sub;
  ngOnInit() {
    this.tipoBusqueda = true;
    this.sub = this.activatedroute.paramMap.pipe(map(params => {
      this.miproyecto = params.get('p');
      this.misede = params.get('s');
      this.documento = params.get('d');
      this.midocumento = this.miproyecto + '_' + this.documento;
    })).subscribe();

    this.afs.doc(`Proyecto/${this.miproyecto}`).valueChanges().pipe(switchMap((m: any) => {
      if (m) {
        return this.afs.doc(`Sede/${this.misede}`).valueChanges().pipe(map((data: any) => {
          this.proyecto = { nombre: m.nombre, id: data.proyecto };
          this.sede = { nombre: data.nombre, id: data.sede };
        }));
      } else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();

    this.auth.user$.pipe(map(m => {
      if (m) {
        this.topList$ = this.afs.collection(`Libros`, ref => ref.where('uid', '==', m.uid)
          .where('sede', '==', this.misede)
          .where('documento', '==', this.midocumento).orderBy('createdAt', 'desc').limit(6)).valueChanges();
      } else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe()

    this.addLibroForm = this.formBuilder.group({
      numLibro: ['', [Validators.required]],
      recordsLength: ['', [Validators.required]],
    });
  }

  ngAfterViewChecked() {
    $('.toast').toast('show');
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async addLibro() {
    const { uid } = await this.auth.getUser();
    const libro: any = {
      contador: 0,
      proyecto: this.miproyecto,
      sede: this.misede,
      documento: this.midocumento,
      nomdoc: this.documento,
      numLibro: this.addLibroForm.value.numLibro,
      recordsLength: this.addLibroForm.value.recordsLength,
      createdAt: Date.now(),
      imagenes: [],
      plantilla: false,
      plantillaLibro: false,
      plantillaImagen: false,
      uid: uid
    };

    const id = this.misede + '_' + this.documento + '_' + this.addLibroForm.value.numLibro;
    this.afs.firestore.doc(`Libros/${id}`).get()
      .then(docSnapshot => {
        if (docSnapshot.exists) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Este libro ya existe!',
          });
          this.addLibroForm.reset();
        } else {
          const ruta = this.miproyecto + '_' + this.documento;
          const datos = { Libros: firebase.firestore.FieldValue.increment(1) };
          this.afs.doc(`Documentos/${ruta}`).set(datos, { merge: true });
          this.afs.doc(`Libros/${id}`).set(libro);
          this.addLibroForm.reset();
        }
      });
  }

  goLibro() {
    if (this.numLibro) {
      const id = this.misede + '_' + this.documento + '_' + this.numLibro;
      this.afs.firestore.doc(`Libros/${id}`).get()
        .then(docSnapshot => {
          if (docSnapshot.exists) {
            if (this.tipoBusqueda) {
              this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede,
                'documentos', this.documento, 'libros', this.numLibro, 'registrar']);
            } else {
              this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede,
                'documentos', this.documento, 'libros', this.numLibro]);
            }
          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Este libro no existe!',
            });
            this.numLibro = null;;
          }
          
        });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ingrese número de libro a buscar!',
      });

    }
  }

  mostrarTodo() {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'documentos', this.documento, 'listado']);
  }

  goListado(libro) {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'documentos',
      this.documento, 'libros', libro.numLibro]);
  }

  goRegistrar(libro) {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede,
      'documentos', this.documento, 'libros', libro.numLibro, 'registrar']);
  }

  goUpload(libro) {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede,
      'documentos', this.documento, 'libros', libro.numLibro, 'upload']);
  }

  showModal() {
    jQuery(this.addMLibro.nativeElement).modal('show');
  }

  goDocumentos() {
    this.router.navigate(['/proyecto', this.miproyecto, 'documents']);
  }

  goHome() {
    this.router.navigate(['Home']);
  }

}
