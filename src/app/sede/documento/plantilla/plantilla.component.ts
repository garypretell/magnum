import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { DragulaService } from 'ng2-dragula';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable, Subject, Subscription } from 'rxjs';
import { switchMap, map, takeUntil, finalize } from 'rxjs/operators';
import { firestore } from 'firebase/app';
declare var jQuery: any;
declare const $;

@Component({
  selector: 'app-plantilla',
  templateUrl: './plantilla.component.html',
  styleUrls: ['./plantilla.component.css']
})
export class PlantillaComponent implements OnInit, OnDestroy {
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;

  private unsubscribe$ = new Subject();
  @ViewChild('myModalS') myModalS: ElementRef;
  @ViewChild('myModalEditS') myModalEditS: ElementRef;
  searchObjectS: any = { nombre: '' };
  campotoEditS: any = {};
  public addCampoFormS: FormGroup;
  arrayTemp: any;
  idx: any;
  miproyecto: any;
  misede: any;
  sede: any;
  documento: any;
  documento$: Observable<any>;
  midocumento: any;
  itemList: any[] = [{ nombre: 'usuarioid', tipo: 'numerico' }, { nombre: 'fecharegistro', tipo: 'fecha' }];
  tipoArray: any[] = [{ id: 1, nombre: 'texto' }, { id: 2, nombre: 'numerico' }, { id: 3, nombre: 'fecha' }, { id: 4, nombre: 'imagen' }];
  campos$: Observable<any>;

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
          campos: sourceModel
        };
        this.afs.doc(`Plantillas/${this.midocumento}`).set(data, { merge: true });
      })
    );
  }

  sub;
  ngOnInit() {
    this.sub = this.activatedroute.paramMap.subscribe(params => {
      this.miproyecto = params.get('p');
      this.misede = params.get('s');
      this.documento = params.get('d');
      this.midocumento = this.miproyecto + '_' + params.get('d').replace(/ /g, '');
      this.campos$ = this.afs.doc(`Plantillas/${this.midocumento}`).valueChanges();
      this.documento$ = this.afs.doc(`Documentos/${this.midocumento}`).valueChanges();
    });

    this.afs.doc(`Proyecto/${this.miproyecto}`).valueChanges().pipe(switchMap((m: any) => {
      return this.afs.doc(`Sede/${this.misede}`).valueChanges().pipe(map((data: any) => {
        this.sede = { nombre: data.nombre, id: data.sede };
      }));
    }), takeUntil(this.unsubscribe$)).subscribe();

    this.addCampoFormS = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      estado: [''],
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.subs.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getColor(color) {
    switch (color) {
      case true:
        return 'black';
      case false:
        return 'red';
    }
  }

  trackByFn(index, item) {
    return item.id;
  }

  openPopover(target: HTMLElement): void {
    $(target).popover({
      title: 'My Popover'
    });
  }

  itemListSaveS() {
    const items: any[] = [
      { nombre: 'usuarioid', tipo: 'numerico', estado: 'principal' },
      { nombre: 'fecharegistro', tipo: 'fecha', estado: 'principal' }
    ];
    this.afs.doc(`Plantillas/${this.midocumento}`).set({ proyecto: this.miproyecto, campos: items });
    this.afs.doc(`Documentos/${this.midocumento}`).set({ plantilla: true }, { merge: true });
  }

  goHome() {
    this.router.navigate(['/Home']);
  }

  goDocumento() {
    this.router.navigate(['/proyecto', this.miproyecto, 'documents']);
  }

  showModalS() {
    jQuery(this.myModalS.nativeElement).modal('show');
  }

  uploadFile(event) {
    const nombre = this.documento + '.html';
    const file = event.target.files[0];
    const filePath = `${this.miproyecto}/${nombre}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();
        this.afs.doc(`Documentos/${this.midocumento}`).set({ plantillaImagen: true }, { merge: true });
      })
    )
      .subscribe();

  }

  deleteCampoS(campo) {
    Swal.fire({
      title: 'Are you sure to delete this field?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete!'
    }).then((result) => {
      if (result.value) {
        this.afs.doc(`Plantillas/${this.midocumento}`).update({
          campos: firestore.FieldValue.arrayRemove(campo)
        });
        Swal.fire(
          'Deleted!',
          'Field has been deleted.',
          'success'
        );
      }
    });
  }

  updateCampoS(campotoEdit) {
    const miArray = this.arrayTemp.campos;
    miArray[this.idx] = campotoEdit;
    const data = {
      campos: miArray
    };
    this.afs.doc(`Plantillas/${this.midocumento}`).set(data, { merge: true });
    jQuery(this.myModalEditS.nativeElement).modal('hide');
  }

  editItem(item) {
    this.afs.doc(`Plantillas/${this.midocumento}`).valueChanges().pipe(map((m: any) => {
      this.arrayTemp = m;
      this.idx = (m.campos).findIndex(x => x.nombre === item.nombre);
      this.campotoEditS = m.campos[this.idx];
    }), takeUntil(this.unsubscribe$)).subscribe();
    jQuery(this.myModalEditS.nativeElement).modal('show');
  }

  async addCampoS() {
    if (this.addCampoFormS.value.nombre === 'PROYECTO' || this.addCampoFormS.value.nombre === 'SEDE') {
      this.addCampoFormS.reset();
      return alert('Este campo está reservado por el sistema');
    }
    const data: any = {
      visible: true,
      estado: true,
      busqueda: false,
      tipo: this.addCampoFormS.value.tipo,
      nombre: this.addCampoFormS.value.nombre,
      id: this.addCampoFormS.value.nombre.replace(/ /g, '')
    };
    await this.afs.doc(`Plantillas/${this.midocumento}`).update({
      campos: firestore.FieldValue.arrayUnion(data)
    });
    this.addCampoFormS.reset();
  }

}
