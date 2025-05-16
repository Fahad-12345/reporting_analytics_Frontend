import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MedicalDoctorComponent } from './medical-doctor.component';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { InitialEvaluationComponent } from './initial-evaluation/initial-evaluation.component';
import { CurrentComplaintsComponent } from './current-complaints/current-complaints.component';
import { PastMedicalHsitoryComponent } from './past-medical-hsitory/past-medical-hsitory.component';
import { PhysicalExaminationComponent } from './physical-examination/physical-examination.component';
import { DiagnosticImpressionComponent } from './diagnostic-impression/diagnostic-impression.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlanOfCareComponent } from './plan-of-care/plan-of-care.component';
import { panelLinks } from './models/panel/panel';
import { CurrentComplaintsContComponent } from './current-complaints-cont/current-complaints-cont.component';
import { PhysicalExaminationContComponent } from './physical-examination-cont/physical-examination-cont.component';
import { PlanOfCareContComponent } from './plan-of-care-cont/plan-of-care-cont.component';
import { TreatmentRenderedComponent } from './treatment-rendered/treatment-rendered.component';
import { TestResultsComponent } from './test-results/test-results.component';

const routes: Routes = [
    {
        path: '',
        component: MedicalDoctorComponent,
        children: [
            // {
            //   path: '',
            //   redirectTo: 'scheduler',
            //   pathMatch: 'full'
            // },
            // {
            //     path: '',
            //     component: SchedulerComponent,
            //     data: {
            //         revokeLogout: true
            //     },
            //     // data: {
            //     //   title: 'Dashboard',
            //     //   link:panelLinks.md.leftPanelLinks
            //     // }
            // },
            // {
            //     path: 'scheduler',
            //     component: SchedulerComponent,
            //     data: {
            //         revokeLogout: true
            //     },
            //     // data: {
            //     //   title: 'Scheduler',
            //     //   link:panelLinks.md.leftPanelLinks
            //     // }
            // },
            {
                path: 'evaluation', component: InitialEvaluationComponent,
                data: {
                    revokeLogout: true
                },
            },
            {
                path: 'current-complaints', component: CurrentComplaintsComponent,
                data: {
                    revokeLogout: true
                },
                // data: {
                //   meta: {
                //     title: 'current-complaints.title',
                //     description: 'current-complaints.text',
                //     override: true
                //   },
                //   link:panelLinks.md.leftPanelLinks
                // },
            },
            {
                path: 'current-complaints-cont', component: CurrentComplaintsContComponent,
                data: {
                    revokeLogout: true
                },
                // data: {
                //   meta: {
                //     title: 'current-complaints-cont.title',
                //     description: 'current-complaints-cont.text',
                //     override: true
                //   },
                //   link:panelLinks.md.leftPanelLinks
                // },
            },
            {
                path: 'past-medical-history', component: PastMedicalHsitoryComponent,
                data: {
                    revokeLogout: true
                },
                // data: {
                //   meta: {
                //     title: 'past-medical-history.title',
                //     description: 'past-medical-history.text',
                //     override: true
                //   },
                //   link:panelLinks.md.leftPanelLinks
                // },
            },
            {
                path: 'test-results', component: TestResultsComponent,
                data: {
                    revokeLogout: true
                },
                // data: {
                //   meta: {
                //     title: 'past-medical-history.title',
                //     description: 'past-medical-history.text',
                //     override: true
                //   },
                //   link:panelLinks.md.leftPanelLinks
                // },
            },
            {
                path: 'physical-examination', component: PhysicalExaminationComponent,
                data: {
                    revokeLogout: true
                },
                // data: {
                //   meta: {
                //     title: 'physical-examination.title',
                //     description: 'physical-examination.text',
                //     override: true
                //   },
                //   link:panelLinks.md.leftPanelLinks
                // },
            },
            {
                path: 'physical-examination-cont', component: PhysicalExaminationContComponent,
                data: {
                    revokeLogout: true
                },
                // data: {
                //   meta: {
                //     title: 'physical-examination.title',
                //     description: 'physical-examination.text',
                //     override: true
                //   },
                //   link:panelLinks.md.leftPanelLinks
                // },
            },
            {
                path: 'diagnostic-impression', component: DiagnosticImpressionComponent,
                data: {
                    revokeLogout: true
                },
                // data: {
                //   meta: {
                //     title: 'diagnostic-impression.title',
                //     description: 'diagnostic-impression.text',
                //     override: true
                //   },
                //   link:panelLinks.md.leftPanelLinks
                // },
            },
            {
                path: 'plan-of-care', component: PlanOfCareComponent,
                data: {
                    revokeLogout: true
                },
                // data: {
                //   meta: {
                //     title: 'plan-of-care.title',
                //     description: 'plan-of-care.text',
                //     override: true
                //   },
                //   link:panelLinks.md.leftPanelLinks
                // },
            },
            {
                path: 'plan-of-care-cont', component: PlanOfCareContComponent,
                data: {
                    revokeLogout: true
                }
            },
            {
                path: 'treatment-rendered', component: TreatmentRenderedComponent,
                data: {
                    revokeLogout: true
                },
            },
            // {path: 'referral-forms', loadChildren: '@appDir/medical-doctor/referal-forms/referal-forms.module#ReferalFormsModule'},
            {
                path: 'test-results',
                loadChildren:()=>import('@appDir/medical-doctor/test-results/test-results.module').then(m => m.TestResultsModule),
                data: {
                    revokeLogout: true
                }
            },
            // { path: 'referral-forms', loadChildren: './referal-forms/referal-forms.module#ReferalFormsModule' },

        ],
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MedicalDoctorRoutingModule {
}
