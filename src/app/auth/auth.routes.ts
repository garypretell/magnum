import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResetPasswordComponent } from 'app/shared/reset-password/reset-password.component';
import { SignInComponent } from './components/sign-in/sign-in.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: SignInComponent, pathMatch: 'full' },
      {
        path: 'resetPassword',
        component: ResetPasswordComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutesModule { }
