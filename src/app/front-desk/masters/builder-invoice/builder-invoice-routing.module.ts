import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvoiceBuilderComponent } from './invoice-builder/invoice-builder.component';

const routes: Routes = [{
  path:'',component:InvoiceBuilderComponent, data: {title: 'Invoice Builder'}
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuilderInvoiceRoutingModule { }
