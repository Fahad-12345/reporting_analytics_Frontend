import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ICDCodesComponent } from './icd-codes/icd-codes.component';

const routes: Routes = [
	{
		path:'',
		component:ICDCodesComponent
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IcdCodesRoutingModule { }
