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
import { FolderComponent } from './folder/folder.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CropComponent } from './crop/crop.component';

@NgModule({
  declarations: [ProyectoComponent, DocumentComponent, ProyectoDetailComponent, CameraComponent, FolderComponent, CropComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FilterPipeModule,
    ProyectoRoutingModule,
    NgxChartsModule,
    ImageCropperModule
  ]
})
export class ProyectoModule { }

