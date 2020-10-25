import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompleteComponent } from './components/complete/complete.component';
import { EvaluatingComponent } from './components/evaluating/evaluating.component';
import { FamilySearchComponent } from './components/familysearch.component';
import { IndexingComponent } from './components/indexing/indexing.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: FamilySearchComponent, pathMatch: 'full' },
      {
        path: ':id',
        children: [
          // { path: '', component: SedeDetailComponent, pathMatch: 'full' },
          { path: 'INDEXING',  component: IndexingComponent },
          { path: 'EVALUATING',  component: EvaluatingComponent },
          { path: 'COMPLETE',  component: CompleteComponent }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FamilySearchRoutingModule { }
