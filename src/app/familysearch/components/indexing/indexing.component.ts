import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/auth/auth.service';
import { TreeviewComponent, TreeviewConfig, TreeviewItem } from 'ngx-treeview';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { isNil, reverse } from 'lodash';
import Swal from 'sweetalert2';
import * as firebase from 'firebase/app';
import { ElectronService } from 'app/core/services';
declare const $;

@Component({
  selector: 'app-indexing',
  templateUrl: './indexing.component.html',
  styleUrls: ['./indexing.component.scss']
})
export class IndexingComponent implements OnInit, OnDestroy {
  checkBoxValue: boolean;
  proyectoid;
  private unsubscribe$ = new Subject();
  image;
  @ViewChild(TreeviewComponent, { static: false }) treeviewComponent: TreeviewComponent;
  contador;
  valueList: Observable<any>;
  campos$: Observable<any>;
  idFolder;
  folderPath;
  folder$: Observable<any>;
  documents$: Observable<any>;
  sede;
  proyecto;
  documento;
  items: any;
  renamedObj;
  imgObj: any = {};
  newObject: any = {};
  itemsList2: any;
  downlineItems: any[];
  miH = innerHeight / 1.2;
  config = TreeviewConfig.create({
    hasAllCheckBox: true,
    hasFilter: true,
    hasCollapseExpand: true,
    maxHeight: this.miH
  });
  public addImagesForm: FormGroup;
  imageObject = [];
  constructor(
    public auth: AuthService,
    public formBuilder: FormBuilder,
    public afs: AngularFirestore,
    private activatedroute: ActivatedRoute,
    public router: Router,
    private electronService: ElectronService
  ) { }

  ngOnInit() {
    this.activatedroute.paramMap.pipe(switchMap((params: any) => {
      this.idFolder = params.get('id');
      this.valueList = this.afs.collection('Images', ref => ref.where('idFolder', '==', this.idFolder)).valueChanges({ idField: 'id' });
      return this.afs.doc(`Folder/${this.idFolder}`).valueChanges().pipe(map((f: any) => {
        this.proyecto = f.proyecto;
        this.contador = f.contador;
        this.documento = f.document;
        this.proyectoid = this.proyecto.id+'_'+f.document;
        this.documents$ = this.afs.collection('Documentos', ref => ref.where('proyecto', '==', this.proyecto.id)).valueChanges({ idField: 'id' })
        this.campos$ = this.afs.doc(`Plantillas/${this.proyectoid}`).valueChanges();
        const dirTree = require("directory-tree");
        const filteredTree = dirTree(`M://${f.pathname}`);
        this.folderPath = `M:/${f.pathname}`;
        this.items = filteredTree.children;
        const newKeys = {
          name: "text"
        };
        this.renamedObj = this.renameKeys(filteredTree, newKeys);
        [this.renamedObj].forEach(this.addId(1));
        this.valueList.pipe(map((f: any) => {
          f.map((t: any) => {
            [this.renamedObj].forEach(this.updateData(t.value));
          });
          this.itemsList2 = Array.of(this.renamedObj)
            .map((value: any) => {
              return new TreeviewItem({ text: value.text, value: value.value, children: value.children, checked: value.checked, disabled: value.disabled });
            });
        }), takeUntil(this.unsubscribe$)).subscribe();
      }));
    })).subscribe();
    this.loadImage();
    $('input:text:visible:first').focus();

    this.addImagesForm = this.formBuilder.group({
      document: ['', [Validators.required]]
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addId(id: number) {
    return function iter(o) {
      if ('path' in o) {
        o.checked = true;
        o.disabled = true
        o.value = id++;
      }
      Object.keys(o).forEach(function (k) {
        Array.isArray(o[k]) && o[k].forEach(iter);
      });
    };
  }

  renameKeys(obj, newKeys) {
    const keyValues = Object.keys(obj).map(key => {
      let newKey = null
      if (key === 'name') {
        newKey = newKeys.name
      } else {
        newKey = key
      }
      if (key === 'children') {
        obj[key] = obj[key].map(obj => this.renameKeys(obj, newKeys));
      }
      return {
        [newKey]: obj[key]
      };
    });
    return Object.assign({}, ...keyValues);
  }

  onSelectedChange(downlineItems: any[]): void {
    this.afs.doc(`Folder/${this.idFolder}`).valueChanges().pipe(map((f: any) => {
      downlineItems.forEach(downlineItem => {
        const item = downlineItem.item;
        this.imageObject.push({ image: 'M:/' + f.pathname + '/' + item.text, thumbImage: 'M:/' + f.pathname + '/' + item.text })
      });
    }), takeUntil(this.unsubscribe$)).subscribe();
    this.downlineItems = downlineItems;
  }

  onFilterChange(e): void { }

  updateData(m: number) {
    return function iter(o) {
      if (o.value == m) {
        o.disabled = true;
        o.checked = true;
      }
      Object.keys(o).forEach(function (k) {
        Array.isArray(o[k]) && o[k].forEach(iter);
      });
    };
  }

  addImages() {
    this.downlineItems.forEach((downlineItem: any) => {
      const item = downlineItem.item;
      const data: any = {
        idFolder: this.idFolder,
        pathname: this.folderPath + '/' + item.text,
        name: item.text.replace(/ /g, ''),
        value: item.value,
        date: Date.now(),
        status: 0,
        document: this.addImagesForm.value.document,
      };
      this.afs.doc(`Images/${data.name}`).set(data, { merge: true });
      const datos = { contador: firebase.firestore.FieldValue.increment(1) };
      this.afs.doc(`Folder/${this.idFolder}`).set(datos, { merge: true });
    });
    this.afs.doc(`Folder/${this.idFolder}`).set({ document: this.addImagesForm.value.document }, { merge: true });
    
  }

  add(registro) {
      this.image = null;
      registro.idFolder = this.idFolder;
      registro.path = this.imgObj.pathname;
      registro.libro = this.imgObj.idFolder;
      registro.createdAt = Date.parse(new Date().toISOString().substring(0, 10));
      registro.mifecha = Date.parse(new Date().toISOString());
      registro.usuarioid = firebase.auth().currentUser.uid;
      registro.proyecto = this.proyecto;
      registro.documento = this.documento;
      this.afs.doc(`Registros/${this.imgObj.id}`).set(registro, { merge: true });
      const inc = { value: firebase.firestore.FieldValue.increment(1) };
      this.afs.doc(`Documentos/${this.proyectoid}`).set(inc, { merge: true });
      this.afs.doc(`Proyecto/${this.proyecto.id}`).set(inc, { merge: true });
      this.newObject = {};
      registro = null;
      if (!this.checkBoxValue){
        this.afs.doc(`Images/${this.imgObj.id}`).set({ status: 1 }, { merge: true })
        this.loadImage();
      }
      $('input:text:visible:first').focus();
  }

  keytab(event) {
    $('input').keydown(function (e) {
      if (e.which === 13) {
        const index = $('input').index(this) + 1;
        $('input').eq(index).focus();
      }
    });
  }

  loadImage() {
    this.afs.collection(`Images`, ref => ref.where('idFolder','==', this.idFolder).where('status', '==', 0).orderBy('value', 'asc').limit(1)).valueChanges({idField: 'id'}).pipe(map( (m: any) => {
      if(m.length > 0){
        this.imgObj = m[0];
        this.image = this.electronService.fs.readFileSync(m[0].pathname).toString('base64');
        console.log(this.image);
        $('input:text:visible:first').focus();
      }else{
        if(this.contador > 0){
          Swal.fire({
            icon: 'warning',
            title: 'Folder completed...',
            text: 'There are no images to index.!',
          })
          this.afs.doc(`Folder/${this.idFolder}`).set({ status: 'EVALUATING' }, { merge: true });
          this.router.navigate(['/familysearch']);
          //mensaje de alerta de que no hay mas imagenes por indexar
        }
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
  }

  goList() {
    this.router.navigate(['/familysearch']);
  }

  goHome() {
    this.router.navigate(['/Home']);
  }

  nextImage(){
    this.afs.doc(`Images/${this.imgObj.id}`).set({ status: 1 }, { merge: true })
    this.loadImage();
  }
}
