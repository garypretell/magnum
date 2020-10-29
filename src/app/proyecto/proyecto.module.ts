import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProyectoRoutingModule } from './proyector.route';
import { ProyectoComponent } from './components/proyecto.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocumentComponent } from './document/document.component';
import { ProyectoDetailComponent } from './proyecto-detail/proyecto-detail.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CameraComponent } from 'app/camera/components/camera/camera.component';

@NgModule({
  declarations: [ProyectoComponent, DocumentComponent, ProyectoDetailComponent, CameraComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FilterPipeModule,
    ProyectoRoutingModule,
    NgxChartsModule,
  ]
})
export class ProyectoModule { }

