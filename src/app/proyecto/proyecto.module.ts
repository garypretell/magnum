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
import { NgImageSliderModule } from 'ng-image-slider';
import { DragulaModule } from 'ng2-dragula';
import { ImageViewerModule } from 'ng2-image-viewer';
import { AngularCropperjsModule } from 'angular-cropperjs';

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
    ImageCropperModule,
    NgImageSliderModule,
    DragulaModule,
    ImageViewerModule,
    AngularCropperjsModule
  ]
})
export class ProyectoModule { }

