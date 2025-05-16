import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CPTCodesComponent } from './cpt-codes/cpt-codes.component';

const routes: Routes = [
	{
		path:'',
		component:CPTCodesComponent
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CptCodesRoutingModule { }
