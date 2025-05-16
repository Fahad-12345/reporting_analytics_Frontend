import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FirmListingComponent } from './firm-listing/firm.component';

const routes: Routes = [
	{
	path:'',
	component:FirmListingComponent,
	pathMatch: 'full'
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FirmRoutingModule { }
