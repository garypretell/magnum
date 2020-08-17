import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth.service';
import { tap, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SuperGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.user$.pipe(
      take(1),
      map(user => user && user.roles.super ? true : false),
      tap(isSuper => {
        if (!isSuper) {
          this.router.navigate(['/Home']);
          console.error('Access denied - SuperAdmins only');
        }
      })
    );
  }
}
