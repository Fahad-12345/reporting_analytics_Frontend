import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Full_ROUTES } from '@appDir/shared/routes/full-layout.routes';
import { WrapperComponent } from './wrapper.component';

const routes: Routes = [
  {
    path:'',
    component: WrapperComponent,
    children: Full_ROUTES
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WrapperRoutingModule { }
