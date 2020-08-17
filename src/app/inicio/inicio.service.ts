import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InicioService {
  private isAdmin = new BehaviorSubject(false);
  currentAdmin = this.isAdmin.asObservable();

  constructor() { }

  changeValue(message: boolean) {
    this.isAdmin.next(message);
   }
}
