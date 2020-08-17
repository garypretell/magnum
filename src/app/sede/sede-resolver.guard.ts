import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
} from '@angular/router';
import { Observable,  of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class SedeResolverGuard implements Resolve<Observable<any>> {
  constructor(private afs: AngularFirestore, private router: Router) {}
  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<any> {
    return of(this.afs
      .collection(`Sede`, (ref) =>
        ref
          .where('proyecto', '==', route.paramMap.get('p'))
          .orderBy('createdAt', 'asc')
      )
      .valueChanges({ idField: 'id' }));
  }
}
