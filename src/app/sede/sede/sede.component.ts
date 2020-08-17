import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AuthService } from 'app/auth/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SedeService } from '../sede.service';
import { InicioService } from 'app/inicio/inicio.service';
declare const jQuery: any;
declare const $;

@Component({
  selector: 'app-sede',
  templateUrl: './sede.component.html',
  styleUrls: ['./sede.component.css']
})
export class SedeComponent implements OnInit, OnDestroy {
  @ViewChild('editModal') editModal: ElementRef;
  @ViewChild('addModal') addModal: ElementRef;
  private unsubscribe$ = new Subject();
  sedes$: Observable<any>;
  searchObject: any = {};
  sedetoEdit: any = {};
  miproyecto: any;

  public addSedeForm: FormGroup;
  constructor(
    public auth: AuthService,
    public formBuilder: FormBuilder,
    public afs: AngularFirestore,
    private activatedroute: ActivatedRoute,
    public sedeService: SedeService,
    public router: Router,
    private inicioService: InicioService,
  ) { }

  sub;
  ngOnInit() {
    this.sub = this.activatedroute.data.pipe(map((data: { sede: Observable<any[]> }) => {
      this.sedes$ = data.sede;
    })).subscribe();

    this.activatedroute.paramMap.pipe(map(params => {
      this.miproyecto = params.get('p');
    }), takeUntil(this.unsubscribe$)).subscribe();

    this.addSedeForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      estado: ['', []],
      secretariaGeneral: ['', [Validators.required]],
      proyecto: [''],
      usuarios: ['']
    });

    this.inicioService.currentAdmin.pipe(map(admin => {
      if (!admin) {
        return this.router.navigate(['/Home']);
      }
    }), takeUntil(this.unsubscribe$)).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  goDocumentos(sede) {
    this.router.navigate(['/proyecto', sede.proyecto, 'sede', sede.id, 'documentos']);
  }

  goUsuario(sede) {
    this.router.navigate(['/proyecto', sede.proyecto, 'sede', sede.id, 'usuarios']);
  }

  editSede(sede) {
    this.afs.doc(`Sede/${sede.id}`).valueChanges().pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      this.sedetoEdit = data;
    });
    jQuery(this.editModal.nativeElement).modal('show');
  }

  updateSede(sede) {
    this.afs.doc(`Sede/${sede.id}`).update(this.sedetoEdit);
    jQuery(this.editModal.nativeElement).modal('hide');
  }

  deleteSede(sede) {
    Swal.fire({
      title: 'Esta seguro de eliminar esta Sede?',
      // text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Eliminar!'
    }).then((result) => {
      if (result.value) {
        this.sedeService.removeSede(sede);
        Swal.fire(
          'Eliminado!',
          'La Sede ha sido eliminada.',
          'success'
        );
      }
    });
  }

  getColor(sede) {
    switch (sede) {
      case true:
        return 'black';
      case false:
        return 'red';
    }
  }

  show_addModal() {
    jQuery(this.addModal.nativeElement).modal('show');
  }

  addSede() {
    const id = this.miproyecto + '_' + (this.addSedeForm.value.nombre).replace(/ /g, '');
    const data: any = {
      estado: true,
      nombre: this.addSedeForm.value.nombre,
      total_imagenes: 0,
      proyecto: this.miproyecto,
      sede: id,
      usuarios: [],
      documentos: [],
      principal: this.addSedeForm.value.secretariaGeneral,
      createdAt: Date.now()
    };

    this.afs.firestore.doc(`Sede/${id}`).get()
      .then(docSnapshot => {
        if (docSnapshot.exists) {
          this.mensajeReject();
          this.addSedeForm.reset();
        } else {
          this.sedeService.createSede(data);
          this.addSedeForm.reset();
          this.mensajeAccept();
          jQuery(this.addModal.nativeElement).modal('hide');
        }
      });
  }

  mensajeAccept() {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: 'success',
      title: 'Sede creada con éxito!'
    });
  }

  mensajeReject() {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Esta sede ya existe!'
    });
  }
}
