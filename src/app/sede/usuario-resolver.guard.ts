import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root',
})
export class UsuarioResolverGuard implements Resolve<Observable<any>> {
  constructor(private afs: AngularFirestore) { }
  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<any> {
    return of(this.afs
      .doc(`Sede/${route.paramMap.get('s')}`)
      .valueChanges());
  }
}
