
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FilterPipeModule } from 'ngx-filter-pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { SedeRoutingModule } from './sede.route';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PaginationService } from './pagination.service';
import { AngularSplitModule } from 'angular-split';
import { DragulaModule } from 'ng2-dragula';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ImageViewerModule } from 'ng2-image-viewer';

import { SedeComponent } from './sede/sede.component';
import { SedeDetailComponent } from './sede-detail/sede-detail.component';
import { DocumentoComponent } from './documento/documento.component';
import { PlantillaComponent } from './documento/plantilla/plantilla.component';
import { LibroComponent } from './documento/libro/libro.component';
import { LibroDetailComponent } from './documento/libro/libro-detail/libro-detail.component';
import { LibroRegistrarComponent } from './documento/libro/libro-registrar/libro-registrar.component';
import { ImprimirRegistroComponent } from './documento/libro/imprimir-registro/imprimir-registro.component';
import { BuscarRegistroComponent } from './documento/buscar-registro/buscar-registro.component';
import { LibroListadoComponent } from './documento/libro/libro-listado/libro-listado.component';
import { UsuarioComponent } from './usuario/usuario.component';
import { UsuarioReporteComponent } from './usuario/usuario-reporte/usuario-reporte.component';
import { UploadImagenComponent } from './documento/libro/upload-imagen/upload-imagen.component';
import { TransferenciaComponent } from './documento/transferencia/transferencia.component';
import { SafePipe } from 'app/shared/pipe/Safe.pipe';

@NgModule({
  declarations: [
    SedeComponent,
    SedeDetailComponent,
    DocumentoComponent,
    PlantillaComponent,
    LibroComponent,
    LibroDetailComponent,
    LibroRegistrarComponent,
    ImprimirRegistroComponent,
    BuscarRegistroComponent,
    LibroListadoComponent,
    UsuarioComponent,
    UsuarioReporteComponent,
    UploadImagenComponent,
    TransferenciaComponent,
    SafePipe,

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SedeRoutingModule,
    NgxChartsModule,
    NgxPaginationModule,
    FilterPipeModule,
    InfiniteScrollModule,
    AngularSplitModule,
    DragulaModule,
    NgxSpinnerModule,
    ImageViewerModule
  ],
   providers: [
    PaginationService
  ]
})
export class SedeModule { }
