import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'app/auth/auth.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  checkBoxValue: boolean;
  validarCodigos: boolean;
  proyecto: any;
  proyectoN: any;
  sedeN: any;
  sede: any;
  public accountForm: FormGroup;
  constructor(
    public router: Router,
    public afs: AngularFirestore,
    public auth: AuthService,
    public afAuth: AngularFireAuth,
    public formBuilder: FormBuilder,
  ) {
    this.checkBoxValue = false;
    this.validarCodigos = false;
  }

  ngOnInit() {
    this.accountForm = this.formBuilder.group({
      displayName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      proyecto: ['', [Validators.required]],
      sede: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  postSignIn(): void {
    this.router.navigate(['/Home']);
  }

  async onRegister() {
    this.afs.firestore.doc(`Sede/${this.accountForm.value.sede}`).get()
      .then(async docSnapshot => {
        if (docSnapshot.exists) {
          const datos = docSnapshot.data();
          this.sedeN = datos.nombre;
          if (datos.proyecto === this.accountForm.value.proyecto) {
            await this.afs.firestore.doc(`Proyecto/${this.accountForm.value.proyecto}`).get().
              then(async snapshot => {
                const data = snapshot.data();
                this.proyectoN = data.nombre;
                this.validarCodigos = false;
                try {
                  const user =
                    await this.auth.register(this.accountForm.value, this.proyectoN, this.sedeN);
                  if (user) {
                    const isVerified = this.auth.isEmailVerified(user);
                    this.redirectUser(isVerified);
                  }
                } catch (error) {
                  console.log('Error', error);
                }
              });
          }
          else {
            this.validarCodigos = true;
          }
        } else {
          this.validarCodigos = true;
        }
      });
  }

  private redirectUser(isVerified: boolean): void {
    if (isVerified) {
      this.router.navigate(['Home']);
    } else {
      this.router.navigate(['verify-email']);
    }
  }

}
