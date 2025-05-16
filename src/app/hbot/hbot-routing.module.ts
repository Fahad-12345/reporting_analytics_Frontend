import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HbotNotesComponent } from './components/hbot-notes/hbot-notes.component';
import { HbotComponent } from './components/hbot/hbot.component';
import { ContradictionToHbotComponent } from './components/contradiction-to-hbot/contradiction-to-hbot.component';

const routes: Routes = [
  {
    path: '',
    component: HbotComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'contradiction-to-hbot' },
      {
        path: 'hbot-notes',
        component: HbotNotesComponent
      },
      {
        path: 'contradiction-to-hbot',
        component: ContradictionToHbotComponent
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HbotRoutingModule { }
