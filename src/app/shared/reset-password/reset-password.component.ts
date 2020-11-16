import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'app/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  public resetForm: FormGroup;
  constructor(
    public router: Router,
    public afs: AngularFirestore,
    public auth: AuthService,
    public afAuth: AngularFireAuth,
    public formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.resetForm = this.formBuilder.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  sendPasswordResetRequest() {
    const email = this.resetForm.controls['correo'].value;

    this.auth.resetPassword(email).then(
      () => {
        this.router.navigate(['/']);
        // success, show some message
      },
      err => {
        console.log(err);
        // handle errors
      }
    );
  }

}
