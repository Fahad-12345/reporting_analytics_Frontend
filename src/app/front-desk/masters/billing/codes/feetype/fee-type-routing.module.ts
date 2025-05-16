import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FeeTypeComponent } from './fee-type/fee-type.component';

const routes: Routes = [
	{
		path:'',
		component:FeeTypeComponent
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeeTypeRoutingModule { }
