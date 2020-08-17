import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProyectoComponent } from './components/proyecto.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: ProyectoComponent, pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProyectoRoutingModule { }
