import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CameraComponent } from 'app/camera/components/camera/camera.component';
import { ProyectoComponent } from './components/proyecto.component';
import { DocumentComponent } from './document/document.component';
import { ProyectoDetailComponent } from './proyecto-detail/proyecto-detail.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: ProyectoComponent, pathMatch: 'full' },
      {
        path: ':p',
        children: [
          { path: '', component: ProyectoDetailComponent, pathMatch: 'full' },
          { path: 'documents', component: DocumentComponent },
          { path: 'camera', component: CameraComponent }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProyectoRoutingModule { }
