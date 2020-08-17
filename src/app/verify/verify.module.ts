import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerifyComponent } from './verify.component';
import { VerifyRoutesModule } from './verify.route';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


@NgModule({
  declarations: [VerifyComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    VerifyRoutesModule
  ]
})
export class VerifyModule { }
