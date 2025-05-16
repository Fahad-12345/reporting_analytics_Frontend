import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';
import { ChooseFacilityComponent } from '@appDir/front-desk/components/choose-facility/choose-facility.component';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { MainService } from '@appDir/shared/services/main-service';
import {
  GenerateRandomDataList,
  setDefaultTimeZone,
} from '@appDir/shared/utils/utils.helpers';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';
import { customizedLabels } from '@appDir/shared/utils/utils.helpers';
import { Dashboard, RoleType } from '@appDir/analytics/helpers/role.enum';
import { AuthService } from '@appDir/shared/auth/auth.service';
import { chartNames } from '@appDir/analytics/helpers/charts.enum';
import { convertToCsv, updateRandomProgress } from '@appDir/analytics/shared/export-csv';

@Component({
  selector: 'app-provider-dashboard',
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProviderDashboardComponent implements OnInit {
  htttpRequests: any[] = [];
  patientChart: any;
  visitStatusPieChart: any;
  visitStatusLineChart: any;
  initialEvaluationChart: any;
  billStatusAnalysisChart: any;
  appointmentAnalysisChart: any;
  dataLength: number = 7;
  dataLabels: any[] = [];
  filters: any = {};
  loadSpin: boolean = false;
  subscriptionsList: Array<Subscription> = [];
  active = 1;
  missingVisitsColumns: Array<string> = [
    'Case Types',
    'Missing ICD codes',
    'Missing CPT codes',
    'Missing Reports',
  ];
  missingVisitsRows: any[] = [];
  // Appointrment Chart
  cancelledAppointmentsCount: number = 0;
  missingVisitsColors: string[] = [
    '#A0AEEA',
    '#56A5F1',
    '#A0AEEA',
    '#56A5F1',
    '#A0AEEA',
    '#56A5F1',
    '#A0AEEA',
    '#56A5F1',
  ];

  scheduledAppointmentsCount: number = 0;
  reScheduledAppointmentsCount: number = 0;
  cancelledList: number[] = [];
  scheduledList: number[] = [];
  reScheduledList: number[] = [];

  // Appointment Chart End

  // Unfinalized Bills Chart
  unfinalizedVisits: any[] = [];
  pageTitle: string = '';
  daysDifference: number[] = [];
  mergedData: any;
  processedData: any;
  // xLabels : any;
  yLabels: any;
  xLabels: any;
  // Unfinalized Bills Chart End

  // Appointment Analysis Chart
  initialEvalution: number = 0;
  reEvaluation: number = 0;
  followUp: number = 0;
  completedAppointments: number = 0;
  scheduledAppointments: number = 0;
  cancelledAppointments: number = 0;
  appointmentAnalysisLabels: number[] = [];
  appointmentAnalysiscompleted: number[] = [];
  initialEvalutionSingle: number[] = [];
  reEvaluationSingle: number[] = [];
  followUpSingle: number[] = [];
  isUserAdmin : Boolean  = false;
  logedInUserType: any;
  userType = RoleType;
  dashboard = Dashboard;
  // Appointment Analysis Chart End
  constructor( private authService: AuthService,
    private mainService: MainService,
   private router : Router ,private storageData: StorageData,
    private ngbModal: NgbModal,
    private analyticsService: AnalyticsService,
    private titleService: Title,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.logedInUserType = this.authService.getUserType();
    const analyticsPermissions : any = this.storageData.getAnalyticsPermission();
    if(analyticsPermissions){
    if (analyticsPermissions.dashboard_type?.length !== 0 ) {
      this.isUserAdmin = true;
    } else {
      this.isUserAdmin = false
    }
  }
    this.pageTitle = this.route?.snapshot?.data['title']
      ? this.route?.snapshot?.data['title']
      : 'Dashboard';
    this.titleService.setTitle('Ovada' + '-' + this.pageTitle);
    Chart.defaults.datasets.bar.barThickness = 12;
    Chart.register(ChartDataLabels);
    this.mainService.setLeftPanel({});
    if (
      !this.storageData.getFacilityLocations().length &&
      this.storageData.getUserId() != 0
    ) {
      var modalRef = this.ngbModal.open(ChooseFacilityComponent, {
        backdrop: 'static',
      });
      modalRef.result.then((res) => {
        // this.logout()
      });
    }

    if (!this.storageData.getUserTimeZone()) {
      this.storageData.setUserTimeZone(setDefaultTimeZone());
    }
    this.destroyChartAndCreateNewCanvas();

    window.addEventListener(
      'resize',
      (event) => {
        this.destroyChartAndCreateNewCanvas();
      },
      true
    );
  }

  ngOnDestroy(): void {
    this.subscriptionsList?.forEach((subscription: Subscription) => {
      subscription?.unsubscribe();
    });
  }

  async destroyChartAndCreateNewCanvas() {
    await this.patientChart?.destroy();
    await this.billStatusAnalysisChart?.destroy();
    await this.appointmentAnalysisChart?.destroy();
    await this.visitStatusLineChart?.destroy();
    await this.initialEvaluationChart?.destroy();
    this.createProvidersChart();
  }

  getAppointmentData(filters) {
    return new Promise((resolve, reject) => {
      let appointmentSubscription = this.analyticsService
        .post(AnalyticsUrlsEnum.Appointments, filters)
        .subscribe(
          (response) => {
            if(response){
              const res = response?.result?.data;
              if (res) {
                this.cancelledAppointmentsCount = res?.Cancelled;
                this.reScheduledAppointmentsCount = res?.re_scheduled;
                this.scheduledAppointmentsCount = res?.scheduled;
                this.cancelledList = res?.Cancelled_list;
                this.scheduledList = res?.scheduled_list;
                this.reScheduledList = res?.re_scheduled_list;
                resolve(true);
              } else {
                resolve(false);
              }
            }
          },
          (error) => {
            resolve(false);
          }
        );
      this.subscriptionsList.push(appointmentSubscription);
    });
  }

  getUnfinalizedBillsData(filters) {
    return new Promise((resolve, reject) => {
      let billsSubscription = this.analyticsService
        .post(AnalyticsUrlsEnum.provider_bills, filters)
        .subscribe(
          (response) => {
            const res = response.result.data;
            if (res) {
              const daysDifference = res.map(
                (item: any) => item.date_difference
              );
              const unfinalizedVisits = res.map(
                (item: any) => item.unfinalized_visit
              );
              const mergedData = daysDifference.map(
                (x: any, index: number) => ({
                  x: x,
                  y: unfinalizedVisits[index],
                })
              );
              let ninetyPlus = 0;
              mergedData.forEach((item: any) => {
                if (item.x > 90) {
                  ninetyPlus += Number(item.y);
                }
              });
              function groupData(data) {
                const groupedData = [];
                const maxRange = Math.min(
                  Math.max(...data.map((point) => point.x)),
                  90
                );
                let i = 0;
                while (i < maxRange) {
                  let step = 5;
                  if (i >= 30) {
                    step = 10;
                  }
                  const filteredPoints = data.filter(
                    (point) => point.x >= i && point.x < i + step
                  );
                  const sumY = filteredPoints.reduce(
                    (acc, val) => acc + Number(val.y),
                    0
                  );
                  groupedData.push({ x: i + '-' + (i + step), y: sumY });

                  i += step;
                }
                return groupedData;
              }
              const processedData = groupData(mergedData);
              this.xLabels = processedData.map((item: any) => item.x);
              const ninetyPlusLabel = '90+';
              this.xLabels.push(ninetyPlusLabel);
              this.yLabels = processedData.map((item: any) => item.y);
              this.yLabels.push(ninetyPlus);
              resolve(true);
            } else {
              resolve(false);
            }
          },
          (error) => {
            resolve(false);
          }
        );
      this.subscriptionsList.push(billsSubscription);
    });
  }

  getAppointmentAnalysisData(filters) {
    return new Promise((resolve, reject) => {
      let billsSubscription = this.analyticsService
        .post(AnalyticsUrlsEnum.Appointment_Analysis, filters)
        .subscribe(
          (response) => {
            const res = response?.result?.data;
            if (res) {
              this.initialEvalution = res?.initial_evaluation;
              this.reEvaluation = res?.re_evaluation;
              this.followUp = res?.follow_up;
              this.scheduledAppointments = res?.Scheduled;
              this.cancelledAppointments = res?.Cancelled;
              this.completedAppointments = res?.completed;
              this.appointmentAnalysisLabels = res?.granular_data?.map(
                (item: any) => item?.date_label
              );
              this.appointmentAnalysiscompleted = res?.granular_data?.map(
                (item: any) => item?.completed
              );
              this.initialEvalutionSingle = res?.granular_data?.map(
                (item: any) => item?.initial_evaluation || 0
              );
              this.reEvaluationSingle = res?.granular_data?.map(
                (item: any) => item?.re_evaluation || 0
              );
              this.followUpSingle = res?.granular_data?.map(
                (item: any) => item?.follow_up || 0
              );

              resolve(true);
            } else {
              resolve(false);
            }
          },
          (error) => {
            resolve(false);
          }
        );
      this.subscriptionsList.push(billsSubscription);
    });
  }

  getMissingVisitsData(filters) {
    return new Promise((resolve, reject) => {
      let billsSubscription = this.analyticsService
        .post(AnalyticsUrlsEnum.Missing_Visits, filters)
        .subscribe(
          (response) => {
            const res = response.result.data;

            if (res) {
              this.missingVisitsRows = res;

              this.missingVisitsRows.forEach((claim, index) => {
                // const firstObj : any = Object.values(claim)[0];

                claim.color = this.missingVisitsColors[index];
              });
              resolve(true);
            } else {
              resolve(false);
            }
          },
          (error) => {
            resolve(false);
          }
        );
      this.subscriptionsList.push(billsSubscription);
    });
  }
  onCaptureFilterSelectEvent(filtersValue: any) {
    this.filters = filtersValue.filters;
    this.dataLength = filtersValue.dataLength;
    this.dataLabels = filtersValue.labels;
    this.loadSpin = true;
    this.htttpRequests.push(this.getAppointmentData(filtersValue.filters));
    this.htttpRequests.push(
      this.getAppointmentAnalysisData(filtersValue.filters)
    );
    this.htttpRequests.push(this.getUnfinalizedBillsData(filtersValue.filters));
    this.htttpRequests.push(this.getMissingVisitsData(filtersValue.filters));
    Promise.all(this.htttpRequests)
      .then((succes) => {
        if (succes) {
          this.loadSpin = false;
          this.destroyChartAndCreateNewCanvas();
        }
      })
      .catch((error) => {
        this.loadSpin = false;
      });
  }
  createProvidersChart() {
    this.createAppointmentAnalysisChart();
    this.createBillschart();
  }

  createBillschart() {
    let truncatedData: string[], tooltipLabels: string[];
    ({ truncatedData, tooltipLabels } = customizedLabels(
      this.filters,
      this.yLabels
    ));
    this.billStatusAnalysisChart = new Chart('billStatusAnalysisCanvas', {
      type: 'bar',
      data: {
        labels: [
          '0-5',
          '5-10',
          '10-15',
          '15-20',
          '20-25',
          '25-30',
          '30-40',
          '40-50',
          '50-60',
          '60-70',
          '70-80',
          '80-90',
          '90+',
        ],
        datasets: [
          {
            label: 'Unfinalized Visits',
            data: truncatedData,
            backgroundColor: ['rgb(153, 204, 255)'],
            barThickness: 8,
            borderWidth: 1,
            borderRadius: 7,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context) {
                const index = context.dataIndex;
                const label = context.dataset.label || '';
                return tooltipLabels[index];
              },
            },
          },
          legend: {
            display: false,
          },
          datalabels: {
            display: false, // Remove labels on each bar
          },
        },
        scales: {
          x: {
            ticks: {
              font: {
                weight: 'bold',
                size: 12,
              },
            },
            grid: {
              display: false,
            },
            title: {
              display: true,
              text: 'No. of Days',
              font: {
                weight: 'bold',
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              display: false,
            },
            title: {
              display: true,
              text: 'Unfinalized Visits Count',
              font: {
                weight: 'bold',
              },
            },
          },
        },
      },
    });
  }

  createAppointmentAnalysisChart() {
    const initialEvaluation = this.initialEvalutionSingle;
    const followUp = this.followUpSingle;
    const reEvaluation = this.reEvaluationSingle;

    this.appointmentAnalysisChart = new Chart('appointmentAnalysisCanvas', {
      type: 'line',
      data: {
        labels: this.appointmentAnalysisLabels,
        datasets: [
          {
            data: this.appointmentAnalysiscompleted,
            label: 'Completed Appointments',
            borderWidth: 2,
            borderColor: '#56A5F1',
            backgroundColor: ['#56A5F1'],
            cubicInterpolationMode: 'default',
            tension: 0.4,
          },
        ],
      },
      options: {
        hover: {
          mode: 'nearest',
          intersect: true,
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false,
            },
          },
          x: {
            stacked: false,
            grid: {
              display: false,
            },
          },
        },
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context) {
                const index = context.dataIndex;
                const label = context.dataset.label || '';
                const ie = 'IE  : ' + initialEvaluation[index];
                const re = 'RE : ' + reEvaluation[index];
                const fu = 'FU : ' + followUp[index];
                return [label + ': ' + context.raw, ie, re, fu];
              },
            },
          },
          datalabels: {
            display: false,
          },
        },
      },
    });
  }
  /// Evaluation Chart
  createinitialevaluationChart() {
    this.initialEvaluationChart = new Chart('initialEvaluationChart', {
      type: 'bar',
      data: {
        labels: this.dataLabels,

        datasets: [
          {
            data: GenerateRandomDataList(this.dataLength),
            label: 'Initial Evaluation',
            borderWidth: 3,
            backgroundColor: ['#B4E8F8'],
          },
          {
            data: GenerateRandomDataList(this.dataLength),
            label: 'Follow ups',
            borderWidth: 3,
            backgroundColor: ['#7BBAF4'],
          },
        ],
      },
      options: {
        hover: { mode: null },
        responsive: true,
        maintainAspectRatio: true,

        plugins: {
          legend: {
            position: 'top',
          },
          datalabels: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false,
            },
          },
          x: {
            stacked: false,
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  showProgressModal() {
    const modalElement = document.getElementById(
      'progressModal'
    ) as HTMLElement;
    const progressBarElement = document.getElementById('progressBar') as HTMLElement;

    if (modalElement) {
      modalElement.style.display = 'block';
    }

    if (progressBarElement) {
      progressBarElement.style.color = 'green';
  }
  }
  hideProgressModals() {
    const modalElement = document.getElementById(
      'progressModal'
    ) as HTMLElement;
    if (modalElement) {
      modalElement.style.display = 'none';
     
    }
  }

  totalAppointmentsExport() {
    const [chartName, fileName] = chartNames.AppointmentTrends.split(',');
    this.exportCommonFunctionForProvider(chartName, fileName);
  }

  unfinalizedVisitsExport() {
    const [chartName, fileName] = chartNames.UnfinalizedVisits.split(',');
    this.exportCommonFunctionForProvider(chartName, fileName);
  }

  completedAppointmentsExport() {
    const [chartName, fileName] = chartNames.CompletedAppointments.split(',');
    this.exportCommonFunctionForProvider(chartName, fileName);
  }

  exportCommonFunctionForProvider(chartName: string, fileName: string) {
    return new Promise((resolve, reject) => {
        const newFilters = { ...this.filters, chartName: chartName };
        const modalElement = document.getElementById('progressModal') as HTMLElement;
        const progressBar = document.getElementById('progressBar') as HTMLProgressElement;
        this.showProgressModal();
        let currentProgress = 0;
        const randomProgressInterval = setInterval(() => {
            currentProgress = updateRandomProgress(currentProgress, progressBar); 
        }, 500);
        newFilters.disableLoaderForExports = true;
        const exportsSubscription =  this.analyticsService.post(AnalyticsUrlsEnum.PROVIDER_EXPORT_API, newFilters)
            .subscribe(
                (response) => {
                    clearInterval(randomProgressInterval); 
                    if (response) {
                        const res = response?.result?.data;
                        if (res && (Array.isArray(res) ? res?.length > 0 : true)) {
                            convertToCsv(res, fileName, modalElement, progressBar);
                        } else {
                            throw new Error('No Data to Export');
                        }
                    }
                },
                (error) => {
                    clearInterval(randomProgressInterval);
                    resolve(error);
                }
            );
          this.subscriptionsList.push(exportsSubscription);
    });
}
}
