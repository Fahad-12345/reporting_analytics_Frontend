import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CodeTypeComponent } from './code-type/code-type.component';

const routes: Routes = [
	{
		path:'',
		component:CodeTypeComponent
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodeTypeRoutingModule { }
