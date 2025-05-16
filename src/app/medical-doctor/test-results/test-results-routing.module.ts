import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Routes, RouterModule} from '@angular/router';
import {TestResultsComponent} from './test-results.component';
import {FormValidateCheckerGuard} from '@appDir/medical-doctor/test-results/can-deactivate/form-validate-checker.guard';


const routes: Routes = [{
    path: '',
    children: [
        {
            path: '',
            component: TestResultsComponent,
            canDeactivate: [FormValidateCheckerGuard]
        },
       /* {
            path: 'physical-occupactional-chiropractor1',
            component: TestResultsComponent,
            pathMatch: ''
        }*/
    ]
}];

@NgModule({
    declarations: [],
    imports: [RouterModule.forChild(routes)],
})
export class TestResultsRoutingModule {
}
