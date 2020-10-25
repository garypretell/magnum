import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';

import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { AuthService } from 'app/auth/auth.service';
import { PaginationService } from 'app/sede/pagination.service';

@Component({
  selector: 'app-libro-listado',
  templateUrl: './libro-listado.component.html',
  styleUrls: ['./libro-listado.component.css']
})
export class LibroListadoComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  message: any;
  miproyecto: any;
  misede: any;
  midocumento: any;
  documento: any;

  proyecto: any;
  sede: any;

  elemento: any;
  libros$: any;

  constructor(
    public page: PaginationService,
    public formBuilder: FormBuilder,
    public afs: AngularFirestore,
    public auth: AuthService,
    public router: Router,
    public activatedroute: ActivatedRoute
  ) { }

  sub;
  ngOnInit() {
    this.elemento = document.getElementById('content');
    this.sub = this.activatedroute.paramMap.subscribe(params => {
      this.miproyecto = params.get('p');
      this.misede = params.get('s');
      this.documento = params.get('d');
      this.midocumento = this.miproyecto + '_' + params.get('d');
      this.page.init('Libros', 'numLibro', this.misede, this.midocumento, { reverse: true, prepend: false });
    });

    this.afs.doc(`Proyecto/${this.miproyecto}`).valueChanges().pipe(switchMap((m: any) => {
      return this.afs.doc(`Sede/${this.misede}`).valueChanges().pipe(map((data: any) => {
        this.proyecto = {nombre: m.nombre, id: data.proyecto};
        this.sede = {nombre: data.nombre, id: data.sede};
      }));
    }), takeUntil(this.unsubscribe$)).subscribe();

    
  }

  ngOnDestroy() {
    this.page.reset();
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  scrollHandler(e) {
    if (e === 'bottom') {
      this.page.more();
    }
  }

  onTop() {
    this.elemento.scrollIntoView = document.documentElement.scrollIntoView({behavior: 'smooth'});
  }

  onScroll() {
    this.page.more();
  }

  trackByFn(index, item) {
    return item.id;
  }

  goRegistrar(libro) {
      this.router.navigate(['/proyecto', this.miproyecto, 'sede',
      this.misede, 'documentos', this.documento, 'libros', libro.numLibro, 'registrar']);
  }

  goDocumentos() {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'documentos']);
  }

  goHome() {
    this.router.navigate(['/Home' ]);
  }

  goListado(libro) {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede',
    this.misede, 'documentos', this.documento, 'libros', libro.numLibro]);
  }
  goLibros() {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede',
      this.misede, 'documentos', this.documento, 'libros']);
  }
}
