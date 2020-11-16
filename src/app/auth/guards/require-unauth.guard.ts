import 'rxjs/add/operator/take';

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth.service';
import { map, take, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class RequireUnauthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.auth.authenticated$.pipe(
      take(1),
      tap(authenticated => {
        if (authenticated) {
          this.router.navigate(['/Home']);
        }
      }),
      map(authenticated => !authenticated));
  }
}
