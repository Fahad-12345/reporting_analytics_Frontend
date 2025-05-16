import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AttorneyComponent } from './attorney-listing/attorney.component';

const routes: Routes = [{
	path:'',
	component:AttorneyComponent,
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterAttorneyRoutingModule { }
