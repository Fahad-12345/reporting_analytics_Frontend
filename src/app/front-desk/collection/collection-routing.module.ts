import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CollectionComponent } from './collection.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: '',
      component: CollectionComponent,
      pathMatch: 'full',
      data: {
        title: 'Collection'
      }
    },
    // {
    //   path: 
    // }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectionRoutingModule { }
