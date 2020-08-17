import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotFoundRoutingModule } from './not-found.route';
import { NotFoundComponentComponent } from './not-found-component.component';

@NgModule({
  declarations: [NotFoundComponentComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NotFoundRoutingModule,
  ]
})
export class NotFoundModule { }
