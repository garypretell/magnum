import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponentComponent } from './not-found-component.component';

const routes: Routes = [
  {
    path: '',
    component: NotFoundComponentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotFoundRoutingModule { }
