import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProyectoRoutingModule } from './proyector.route';
import { ProyectoComponent } from './components/proyecto.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ProyectoComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FilterPipeModule,
    ProyectoRoutingModule
  ]
})
export class ProyectoModule { }

