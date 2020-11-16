import { Meta, Title } from '@angular/platform-browser';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable, of} from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
declare var jQuery: any;
import { IpcRenderer } from 'electron';
declare const $;

@Component({
  selector: 'app-sign-in',
  styleUrls: ['./sign-in.component.css'],
  templateUrl: './sign-in.component.html'
})
export class SignInComponent implements OnInit {
  currentDate: any;
  ocultar: boolean;
  projects: Observable<any>;
  view: any;
  miError: boolean;
  public loginForm: FormGroup;
  private ipc: IpcRenderer;
  constructor(
    public meta: Meta, public title: Title,
    public auth: AuthService,
    public router: Router,
    public formBuilder: FormBuilder,
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,

  ) {
    this.view = [innerWidth / 1.6, innerHeight / 1.6];
    this.currentDate = new Date();
    this.meta.updateTag({ name: 'description', content: 'Sign In' });
    this.title.setTitle('MAGNUM');
    this.ocultar = true;
  }

  sub;
  ngOnInit() {
    this.miError = false;
    this.projects = this.afs
      .collection('Proyecto', ref => ref.where('visible','==', true))
      .valueChanges();
    this.loginForm = this.formBuilder.group({
      email:  ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required ]],
    });
  }

  postSignIn() {
    this.router.navigate(['/Home']);
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  onSelect(data): void {
    // console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    // console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    // console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  onResize(event) {
    this.view = [event.target.innerWidth / 1.6, event.target.innerHeight / 1.6];
  }

  goAccount() {
    this.router.navigate(['/registrar']);
  }

  async onLogin() {
    try {
      const user = await this.auth.login(this.loginForm.value.email, this.loginForm.value.password);
      if (user) {
        const isVerified = this.auth.isEmailVerified(user);
        this.redirectUser(isVerified);
      }
      else {
        this.miError = true;
      }
    } catch (error) {
      console.log('Error->', error);
    }
  }

  private redirectUser(isVerified: boolean): void {
    if (isVerified) {
      this.router.navigate(['Home']);
    } else {
      this.router.navigate(['verify-email']);
    }
  }

  clearError(): void {
    this.miError = false;
  }

  resetPassword()  {
    this.router.navigate(['/resetPassword']);
  }

}
