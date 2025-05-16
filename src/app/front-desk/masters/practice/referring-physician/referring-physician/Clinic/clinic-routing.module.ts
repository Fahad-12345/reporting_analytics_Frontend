import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClinicsComponent } from './clinics/clinics.component';
const routes: Routes = [
	{
	path:'',
	component:ClinicsComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicsRoutingModule { }
