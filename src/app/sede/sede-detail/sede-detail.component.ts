import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AuthService } from 'app/auth/auth.service';
import { FormBuilder } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { SedeService } from '../sede.service';

import Swal from 'sweetalert2';
import { map } from 'rxjs/operators';
declare const jQuery: any;
declare const $;
@Component({
  selector: 'app-sede-detail',
  templateUrl: './sede-detail.component.html',
  styleUrls: ['./sede-detail.component.scss']
})
export class SedeDetailComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();

  miproyecto: any;
  misede: any;
  misede$: Observable<any>;
  constructor(
    public auth: AuthService,
    public formBuilder: FormBuilder,
    public afs: AngularFirestore,
    private activatedroute: ActivatedRoute,
    public router: Router,
    public sedeService: SedeService
  ) { }

  sub;
  ngOnInit() {
    this.sub = this.activatedroute.paramMap.pipe(map(params => {
      this.miproyecto = params.get('p');
      this.misede = params.get('s');
      this.afs.firestore.doc(`Sede/${params.get('s')}`).get()
      .then(docSnapshot => {
        if (!docSnapshot.exists) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Esta Sede no ha sido registrada!'
          });
          return this.router.navigate(['/Home']);
        } else {
          this.misede$ = this.afs.doc(`Sede/${params.get('s')}`).valueChanges();
        }
      });
    })).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  editSede(sede) {}

  goDocumentos(sede) {
    this.router.navigate(['/proyecto', this.miproyecto, 'sede', this.misede, 'documentos']);
  }

}
