import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { ProyectoService } from '../proyecto.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { takeUntil } from 'rxjs/operators';
declare var jQuery: any;

@Component({
  selector: 'app-proyecto',
  templateUrl: './proyecto.component.html',
  styleUrls: ['./proyecto.component.scss']
})
export class ProyectoComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  @ViewChild('myModal') myModal: ElementRef;
  @ViewChild('myModalEdit') myModalEdit: ElementRef;

  searchObject: any = { nombre: '' };
  p = 1;
  proyectotoEdit: any = {};
  editProyecto: boolean;
  public addProyectoForm: FormGroup;
  public editProyectoForm: FormGroup;
  constructor(
    public formBuilder: FormBuilder,
    public afs: AngularFirestore,
    public proyectoService: ProyectoService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.addProyectoForm = this.formBuilder.group({
      nombre:  ['', [Validators.required ]],
      estado:  [''],
      total_registros:  [''],
      transferencia: [''],
      secretarias: [''],
      sedes: [''],
      createdAt: [''],
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  limpiarB() {
    this.searchObject.nombre = '';
  }

  showModal() {
    jQuery(this.myModal.nativeElement).modal('show');
  }

  enableEditing(event, diocesis) {
    this.afs.doc(`Proyecto/${diocesis.id}`).valueChanges().pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      this.proyectotoEdit = data;
    });
    jQuery(this.myModalEdit.nativeElement).modal('show');
    this.editProyecto = true;
  }

  addProyecto() {
    this.afs.firestore.doc(`Proyecto/${(this.addProyectoForm.value.nombre).replace(/ /g, '')}`).get()
    .then(docSnapshot => {
      if (docSnapshot.exists) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Este proyecto ya ha sido registrado!'
        });
        this.addProyectoForm.reset();
      } else {
        this.addProyectoForm.value.transferencia = false;
        this.addProyectoForm.value.estado = true;
        this.addProyectoForm.value.total_registros = 0;
        this.addProyectoForm.value.secretarias = [];
        this.addProyectoForm.value.sedes = [];
        this.addProyectoForm.value.createdAt = Date.now();
        const diocesis = this.afs.doc(`Proyecto/${(this.addProyectoForm.value.nombre).replace(/ /g, '')}`);
        diocesis.set(this.addProyectoForm.value, { merge: true });
        this.addProyectoForm.reset();
      }
    });
  }

  updateProyecto(proyectotoEdit) {
    this.proyectoService.updateProyectos(this.proyectotoEdit);
    jQuery(this.myModalEdit.nativeElement).modal('hide');
  }

  deleteProyecto(proyecto) {
    Swal.fire({
      title: 'Esta seguro de eliminar este Proyecto?',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Eliminar!'
    }).then((result) => {
      if (result.value) {
        this.proyectoService.removeProyectos(proyecto);
        Swal.fire(
          'Eliminado!',
          'El Proyecto ha sido eliminado.',
          'success'
        );
      }
    });
  }

  getColor(color) {
    switch (color) {
      case true:
        return 'black';
      case false:
        return 'red';
    }
  }

  goSedes(doc) {
    this.router.navigate(['/proyecto', doc.id, 'sede']);
  }

  trackByFn(index, item) {
    return item.id;
  }
}
