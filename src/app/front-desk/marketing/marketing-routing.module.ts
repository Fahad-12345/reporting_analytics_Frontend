import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarketingFormComponent } from './marketing-form/marketing-form.component';
// import { MarketingFormComponent } from '../marketing-form/marketing-form.component';

const routes: Routes = [{ path: '', component: MarketingFormComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketingRoutingModule { }
