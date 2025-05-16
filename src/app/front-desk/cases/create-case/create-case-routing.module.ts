import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateCaseComponent } from './components/create-case/create-case.component';

const routes: Routes = [
  { path: ':id', component: CreateCaseComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateCaseRoutingModule { }
