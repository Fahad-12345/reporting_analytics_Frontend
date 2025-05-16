import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HCPCSCodesComponent } from './hcpcs-codes/hcpcs-codes.component';

const routes: Routes = [{
	path:'',
	component:HCPCSCodesComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HcpcsCodesRoutingModule { }
