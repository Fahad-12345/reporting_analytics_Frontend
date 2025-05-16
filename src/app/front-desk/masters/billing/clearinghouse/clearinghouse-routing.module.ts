import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClearinghouseComponent } from './clearinghouse.component';

const routes: Routes = [{ path: '', component: ClearinghouseComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClearinghouseRoutingModule { }
