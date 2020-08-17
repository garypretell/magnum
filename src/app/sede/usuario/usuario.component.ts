import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { firestore } from 'firebase/app';
import { AuthService } from 'app/auth/auth.service';
import Swal from 'sweetalert2';
declare const jQuery: any;
declare const $;

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  @ViewChild('editModal') editModal: ElementRef;
  usuariotoEdit: any = {};

  subscriber: any;
  editor: any;
  admin: any;
  super: any;

  miproyecto: any;
  misede: any;

  arrayTemp: any;
  idx: any;
  campotoEditS: any = {};

  usuarios$: Observable<any>;
  searchObject: any = {};
  constructor(
    public afs: AngularFirestore,
    public router: Router,
    public activatedroute: ActivatedRoute,
    public auth: AuthService,
  ) { }


  sub;
  ngOnInit() {
    this.sub = this.activatedroute.data.subscribe((data: { usuarios: Observable<any[]> }) => {
      this.usuarios$ = data.usuarios;
    });

    this.activatedroute.paramMap.pipe(map(params => {
      this.miproyecto = params.get('p');
      this.misede = params.get('s');
    }), takeUntil(this.unsubscribe$)).subscribe();

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  deleteUsusario(usuario) {
    Swal.fire({
      title: 'Esta seguro de eliminar este usuario?',
      // text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Eliminar!'
    }).then((result) => {
      if (result.value) {
        this.afs.doc(`Sede/${this.misede}`).update({
          usuarios: firestore.FieldValue.arrayRemove(usuario)
        });
        this.afs.doc(`usuarios/${usuario.uid}`).delete();
        Swal.fire(
          'Eliminado!',
          'El usuario ha sido eliminado.',
          'success'
        );
      }
    });
  }

  editUsuario(usuario) {
    this.afs.doc(`usuarios/${usuario.uid}`).valueChanges().pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
      this.usuariotoEdit = usuario.uid;
      this.subscriber = data.roles.subscriber;
      this.editor = data.roles.editor;
      this.admin = data.roles.admin;
      this.super = data.roles.super;
    });
    this.afs.doc(`Proyecto/${this.miproyecto}`).valueChanges().pipe(map((m: any) => {
      this.arrayTemp = m;
      this.idx = (m.usuarios).findIndex(x => x.uid === usuario.uid);
      this.campotoEditS = m.usuarios[this.idx];
    }), takeUntil(this.unsubscribe$)).subscribe();
    jQuery(this.editModal.nativeElement).modal('show');
  }

  async updateUsuario() {
    const roles: any = {
      roles: {
        admin: this.admin,
        editor: this.editor,
        subscriber: this.subscriber,
        super: this.super
      }
    };
    if (this.admin === true) {
      this.campotoEditS.admin = true;
      const miArray = this.arrayTemp.usuarios;
      miArray[this.idx] = this.campotoEditS;
      const data = {
        usuarios: miArray
      };
      this.afs.doc(`Proyecto/${this.miproyecto}`).set(data, { merge: true });
    }else {
      this.campotoEditS.admin = false;
      const miArray = this.arrayTemp.usuarios;
      miArray[this.idx] = this.campotoEditS;
      const data = {
        usuarios: miArray
      };
      this.afs.doc(`Proyecto/${this.miproyecto}`).set(data, { merge: true });
    }
    await this.afs.doc(`usuarios/${this.usuariotoEdit}`).set(roles, { merge: true });
    jQuery(this.editModal.nativeElement).modal('hide');
  }

  goReporte(usuario) {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'usuarios', usuario.uid]);
  }
}
