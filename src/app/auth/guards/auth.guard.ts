import 'rxjs/add/operator/take';

import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth.service';

import { tap, map, take } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {

    return this.auth.user$.pipe(
      take(1),
      map(user => user && this.auth.canRead(user) ? true : false),
      tap(canView => {
        if (!canView) {
          this.router.navigate(['/']);
          console.error('Access denied. Must have permission to view content');
        }
      })
    );
  }
}
