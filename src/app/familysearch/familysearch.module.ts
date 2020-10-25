import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilySearchComponent } from './components/familysearch.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { FamilySearchRoutingModule } from './familysearch.route';
import { TreeviewModule } from 'ngx-treeview';
import { IndexingComponent } from './components/indexing/indexing.component';
import { EvaluatingComponent } from './components/evaluating/evaluating.component';
import { CompleteComponent } from './components/complete/complete.component';
import { AngularSplitModule } from 'angular-split';
import { NgImageSliderModule } from 'ng-image-slider';
import { DragulaModule } from 'ng2-dragula';
import { ImageViewerModule } from 'ng2-image-viewer';


@NgModule({
  declarations: [FamilySearchComponent, IndexingComponent, EvaluatingComponent, CompleteComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FilterPipeModule,
    FamilySearchRoutingModule,
    AngularSplitModule,
    TreeviewModule,
    NgImageSliderModule,
    DragulaModule,
    ImageViewerModule
  ]
})
export class FamilySearchModule { }
