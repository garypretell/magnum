import { Component, OnInit } from '@angular/core';

import Swal from 'sweetalert2';
import * as firebase from 'firebase/app';
import { ElectronService } from 'app/core/services';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'app/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
declare const $;

@Component({
  selector: 'app-evaluating',
  templateUrl: './evaluating.component.html',
  styleUrls: ['./evaluating.component.scss']
})
export class EvaluatingComponent implements OnInit {
  private unsubscribe$ = new Subject();
  idFolder;
  contador;
  documento;
  campos$: Observable<any>;
  imgObj: any = {};
  image;
  newObject: any = {};
  editObject: any = {};
  mifolder: any = {};
  lst: any[] = [];
  constructor(
    public auth: AuthService,
    public afs: AngularFirestore,
    private activatedroute: ActivatedRoute,
    public router: Router,
    private electronService: ElectronService
  ) { }

  
  ngOnInit(): void {
    this.activatedroute.paramMap.pipe(switchMap((params: any) => {
      this.idFolder = params.get('id');
      return this.afs.doc(`Folder/${this.idFolder}`).valueChanges().pipe(map((f: any) => {
        this.mifolder = f;
        const project = f.proyecto;
        this.contador = f.contador;
        this.documento = f.document;
        const proyectoid = project.id + '_' + f.document;
        this.campos$ = this.afs.doc(`Plantillas/${proyectoid}`).valueChanges();
      }));
    })).subscribe();
    this.loadImage();
    $('input:text:visible:first').focus();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadImage() {
    this.afs.collection(`Images`, ref => ref.where('idFolder', '==', this.idFolder).where('status', '==', 1).orderBy('value', 'asc').limit(1)).valueChanges({ idField: 'id' }).
      pipe(switchMap((m: any) => {
        if (m.length > 0) {
          this.imgObj = m[0];
          this.image = this.electronService.fs.readFileSync(m[0].pathname).toString('base64');
          return this.afs.doc(`Registros/${m[0].id}`).valueChanges().pipe(map((r: any) => {
            this.newObject = r;
          }));
        } else {
           Swal.fire({
            icon: 'warning',
            title: 'Folder completed...',
            text: 'There are no images to update.!',
          })
           this.afs.doc(`Folder/${this.idFolder}`).set({ status: 'COMPLETE' }, { merge: true });
           return this.router.navigate(['/familysearch']);
        }
      }), takeUntil(this.unsubscribe$)).subscribe();
  }

  add() {
    this.image = null;
    this.afs.doc(`Registros/${this.imgObj.id}`).set(this.newObject, { merge: true });
    this.afs.doc(`Images/${this.imgObj.id}`).set({ status: 2 }, { merge: true });
    this.newObject = {};
    this.loadImage();
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

  goList() {
    this.router.navigate(['/familysearch']);
  }

  goHome() {
    this.router.navigate(['/Home']);
  }

  open() {
    const shell = require('electron').shell;
    shell.openExternal('M:/Reportes/my-page.html')
  }

}
