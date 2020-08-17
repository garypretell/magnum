import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InicioComponent } from './components/inicio.component';
import { InicioRoutingModule } from './inicio.route';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  declarations: [InicioComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InicioRoutingModule,
    NgxChartsModule,
    NgxPaginationModule,
    FilterPipeModule
  ]
})
export class InicioModule { }
