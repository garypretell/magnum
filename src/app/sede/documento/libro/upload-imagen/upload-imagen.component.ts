import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, of, Subject } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { finalize, map, takeUntil, take } from 'rxjs/operators';
import { DragulaService } from 'ng2-dragula';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload-imagen',
  templateUrl: './upload-imagen.component.html',
  styleUrls: ['./upload-imagen.component.css']
})
export class UploadImagenComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  selectedFiles: FileList;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  visible: boolean;

  progressInfos = [];
  message = '';

  fileInfos: Observable<any>;

  miproyecto: any;
  misede: any;
  documento: any;
  midocumento: any;
  milibro: any;

  misimagenes$: Observable<any>;
  misdatos: any[] = [];

  ruta: any;
  arrayTemp: any;
  MANY_ITEMS = 'MANY_ITEMS';
  subs = new Subscription();
  constructor(
    private storage: AngularFireStorage,
    public formBuilder: FormBuilder,
    public afs: AngularFirestore,
    public router: Router,
    public activatedroute: ActivatedRoute,
    private dragulaService: DragulaService
  ) {
    this.subs.add(dragulaService.dropModel(this.MANY_ITEMS)
      .subscribe(({ el, target, source, sourceModel, targetModel, item }) => {
        this.arrayTemp = targetModel;
        const data = {
          imagenes: sourceModel
        };
        this.afs.doc(`Libros/${this.ruta}`).set(data, { merge: true });
      })
    );
  }

  sub;
  ngOnInit() {
    this.sub = this.activatedroute.paramMap.subscribe(params => {
      this.miproyecto = params.get('p');
      this.misede = params.get('s');
      this.documento = params.get('d');
      this.milibro = params.get('l');
      this.ruta = this.misede + '_' + params.get('d').replace(/ /g, '') + '_' + this.milibro;
      this.misimagenes$ = this.afs.doc(`Libros/${this.ruta}`).valueChanges();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.subs.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  selectFiles(event) {
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
  }

  async uploadFiles() {
    this.visible = true;
    this.misimagenes$.pipe(take(1)).subscribe(async data => {
      if (data) {
        const arrayDatos = data.imagenes;
        this.misdatos = arrayDatos.map(a => a.name);
        for (let i = 0; i < this.selectedFiles.length; i++) {
          const isInArray = this.misdatos.includes(this.selectedFiles[i].name);
          if (isInArray === false) {
            await this.upload(i, this.selectedFiles[i]);
               }
             }
          }
          else { return of(null); }
        });
    // tslint:disable-next-line:prefer-for-of


  }

  async upload(idx, file) {
    const imagenes: any = {
      path: file.path,
      name: file.name,
      estado: false
    };
    await this.afs.doc(`Libros/${this.ruta}`).update({
      imagenes: firestore.FieldValue.arrayUnion(imagenes)
    });
    this.progressInfos[idx] = { value: 0, fileName: file.name };
  }

  deleteImagen(imagen) {
    Swal.fire({
      title: 'Esta seguro de eliminar esta imágen?',
      // text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Eliminar!'
    }).then((result) => {
      if (result.value) {
        this.afs.doc(`Libros/${this.ruta}`).update({
          imagenes: firestore.FieldValue.arrayRemove(imagen)
        });
        Swal.fire(
          'Eliminado!',
          'La imágen ha sido eliminada.',
          'success'
        );
      }
    });
  }

  goLibro() {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'documentos', this.documento, 'libros']);
  }

  goMiLibro() {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'documentos', this.documento, 'libros', this.milibro]);
  }

  goSede() {
    this.router.navigate(['Home']);
  }

  goDocumento() {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'documentos']);
  }

}
