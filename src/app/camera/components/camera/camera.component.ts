import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/auth/auth.service';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
declare const jQuery: any;
declare const $;

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements OnInit, OnDestroy {
  @ViewChild('addMLibro') addMLibro: ElementRef;
  @ViewChild('inputEl') inputEl: ElementRef;
  private unsubscribe$ = new Subject();
  addFolderForm: FormGroup;
  listado$: Observable<any>;
  documentos$: Observable<any>;
  miproyecto;
  proyecto;
  sede;
  documento;
  p = 1;
  mensaje = 'Select a document to start...';
  buttonEnabled: boolean;
  searchFolder: any = {name: ''};
  
  constructor(
    public formBuilder: FormBuilder,
    private afs: AngularFirestore,
    public auth: AuthService,
    private router: Router,
    private activatedroute: ActivatedRoute
  ) { }

  sub;
  async ngOnInit() {
    this.addFolderForm = this.formBuilder.group({
      numFolder: ['', [Validators.required]]
    });

    const { uid } = await this.auth.getUser();
    this.sub = this.activatedroute.paramMap.pipe(map(params => {
      this.documentos$ = this.afs.collection('Documentos', ref => ref.where('proyecto', '==', params.get('p'))
        .orderBy('createdAt', 'desc')).valueChanges({ idField: 'ids' });
      this.miproyecto = params.get('p');
    })).subscribe();

    this.afs.doc(`usuarios/${uid}`).valueChanges().pipe(map((data: any) => {
      if (data) {
        this.proyecto = data.proyecto;
        this.sede = data.sede;
      } else {
        return of(null);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
    this.listado$ = this.afs.collection('Folder', ref => ref
      .where('status', '==', 'INIT')).valueChanges({ idField: 'id' });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  filterList() {
    this.mensaje = 'No items found!';
    this.buttonEnabled = true;

    this.listado$ = this.afs.collection('Folder', ref => ref.where('proyecto.id', '==', this.proyecto.id)
      .where('document', '==', this.documento.nombre)
      .where('status', '==', 'CAPTURE')
      .orderBy('date', 'desc').limit(14)).valueChanges({ idField: 'id' });
  }

  createFolder() {
    const ruta = this.sede.id + '_' + this.documento.nombre + '_' + this.addFolderForm.value.numFolder;
    const name = this.addFolderForm.value.numFolder;
    this.afs.firestore.doc(`Folder/${ruta}`).get()
      .then(docSnapshot => {
        if (docSnapshot.exists) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'This book has already been registered!'
          });
          this.addFolderForm.reset();
        } else {
          var fs = require('fs');
          var dir = `M:/Imagenes/${ruta}/${name}`;
          const data: any = {
            pathname: `Imagenes/${ruta}/${name}`,
            name: this.addFolderForm.value.numFolder,
            value: false,
            date: Date.now(),
            status: "CAPTURE",
            document: this.documento.nombre,
            contador: 0,
            proyecto: this.proyecto
          };
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true }, (err) => {
              if (err) throw err;
            });
            this.afs.doc(`Folder/${ruta}`).set(data, { merge: true });
            this.addFolderForm.reset();
            jQuery(this.addMLibro.nativeElement).modal('hide');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Este Libro ya ha sido registrado!'
            });
          }
        }
      });
  }

  showModal() {
    jQuery(this.addMLibro.nativeElement).modal('show');
    setTimeout(() => this.inputEl.nativeElement.focus(), 500);
  }

  getColor(estado) {
    switch (estado) {
      case 'WAITING':
        return 'red';
      default:
        return 'black';
    }
  }

  eliminar(item) {
    Swal.fire({
      title: 'Are you sure to delete this folder?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete!'
    }).then((result) => {
      if (result.value) {
        var ret = item.pathname.replace(`/${item.name}`, '');
        var dir = `M:/${ret}`
        this.deleteFolderRecursive(dir);
        this.afs.doc(`Folder/${item.id}`).delete();
        Swal.fire(
          'Deleted!',
          'The folder has been deleted.',
          'success'
        );
      }
    });

  }

  goStatus(item) {

  }

  deleteFolderRecursive(path) {
    const fs = require('fs');
    const Path = require('path');
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file, index) => {
        const curPath = Path.join(path, file);
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          this.deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };

  goPhoto(f) {
    this.router.navigate(['/proyecto', this.miproyecto, 'camera', f.id]);
  }

}
