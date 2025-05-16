
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
//   {
//     path: '',
//     component: PaymentComponent,
//     children: [
//       { path: '', pathMatch: 'full', redirectTo: 'payment-list' },
//     //   {
//     //     path: 'hbot-notes',
//     //     component: HbotNotesComponent
//     //   },
//       {
//         path: 'payment-list',
//         component: PaymentListComponent
//       }
//     ]
//   },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DenialRoutingModule { }
