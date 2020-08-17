import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard, EditorGuard, SuperGuard } from '../auth/guards';
import { SedeComponent } from './sede/sede.component';
import { SedeDetailComponent } from './sede-detail/sede-detail.component';
import { DocumentoComponent } from './documento/documento.component';
import { PlantillaComponent } from './documento/plantilla/plantilla.component';
import { LibroComponent } from './documento/libro/libro.component';
import { LibroDetailComponent } from './documento/libro/libro-detail/libro-detail.component';
import { LibroRegistrarComponent } from './documento/libro/libro-registrar/libro-registrar.component';
import { LibroListadoComponent } from './documento/libro/libro-listado/libro-listado.component';
import { UsuarioComponent } from './usuario/usuario.component';
import { UsuarioResolverGuard } from './usuario-resolver.guard';
import { UsuarioReporteComponent } from './usuario/usuario-reporte/usuario-reporte.component';
import { BuscarRegistroComponent } from './documento/buscar-registro/buscar-registro.component';
import { UploadImagenComponent } from './documento/libro/upload-imagen/upload-imagen.component';



const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: SedeComponent, pathMatch: 'full' },
      {
        path: ':s',
        children: [
          { path: '', component: SedeDetailComponent, pathMatch: 'full' },
          {
            path: 'documentos',
            children: [
              { path: '', component: DocumentoComponent, pathMatch: 'full' },
              {
                path: ':d',
                children: [
                  { path: '', redirectTo: 'libros', pathMatch: 'full' },
                  { path: 'listado', component: LibroListadoComponent },
                  { path: 'busqueda', component: BuscarRegistroComponent },
                  { path: 'plantilla', component: PlantillaComponent, canActivate: [AdminGuard] },
                  {
                    path: 'libros',
                    children: [
                      { path: '', component: LibroComponent, pathMatch: 'full' },
                      {
                        path: ':l',
                        children: [
                          { path: '', component: LibroDetailComponent, pathMatch: 'full' },
                          { path: 'registrar', component: LibroRegistrarComponent },
                          { path: 'upload', component: UploadImagenComponent }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            path: 'usuarios',
            children: [
              {
                path: '', component: UsuarioComponent,
                canActivate: [AdminGuard],
                resolve: { usuarios: UsuarioResolverGuard }, pathMatch: 'full'
              },
              {
                path: ':u',
                children: [
                  { path: '', redirectTo: 'reportes', pathMatch: 'full' },
                  { path: 'reportes', component: UsuarioReporteComponent }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SedeRoutingModule { }
