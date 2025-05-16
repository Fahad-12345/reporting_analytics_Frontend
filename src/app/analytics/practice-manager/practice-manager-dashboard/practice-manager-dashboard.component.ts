import { Component, HostListener, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';

import { ChooseFacilityComponent } from '@appDir/front-desk/components/choose-facility/choose-facility.component';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { MainService } from '@appDir/shared/services/main-service';
import { isArray, setDefaultTimeZone } from '@appDir/shared/utils/utils.helpers';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ArcElement, Chart } from 'chart.js/auto';
import { Subscription } from 'rxjs';
import { customizedLabels } from '@appDir/shared/utils/utils.helpers';
import { Dashboard, RoleType } from '@appDir/analytics/helpers/role.enum';
import { AuthService } from '@appDir/shared/auth/auth.service';
import { convertToCsv, updateRandomProgress } from '@appDir/analytics/shared/export-csv';
import { chartNames } from '@appDir/analytics/helpers/charts.enum';

@Component({
  selector: 'app-practice-manager-dashboard',
  templateUrl: './practice-manager-dashboard.component.html',
  styleUrls: ['./practice-manager-dashboard.component.scss']
})
export class PracticeManagerDashboardComponent implements OnInit, OnDestroy, OnChanges {
  @HostListener('window:resize', ['$event'])
  appointmentTrendsAnalysisChart: any;
  visitStatusAnalysisChart: any;
  billStatusAnalysisChart: any;
  denialTypeAnalysisChart: any;
  averageGapChartRef: any;
  averageAppointmentGapChartRef: any;
  filters: any;
  isUserAdmin : Boolean  = false;

  completedData: any[] = [];
  scheduledData: any[] = [];
  cancelledData: any[] = [];
  completedTotal: number = 0;
  totalAppointments: number = 0;
  scheduledTotal: number = 0;
  rescheduledTotal: number = 0;
  cancelledTotal: number = 0;
  noShowTotal: number = 0;
  completedPercent: number = 0;
  scheduledPercent: number = 0;
  rescheduledPercent: number = 0;
  cancelledPercent: number = 0;
  noShowPercent: number = 0;
  minGap: number = 0;
  maxGap: number = 0;
  avgGap: number = 0;
  minDuration: number = 0;
  maxDuration: number = 0;
  avgDuration: number = 0;
  appointmentLabel: any[] = [];

  loadSpin: boolean = false;
  newPatients: number = 0;
  newPatientsChanged: number = 0;
  returningPatients: number = 0;
  returningPatientsChanged: number = 0;
  newCases: number = 0;
  newCasesChanged: number = 0;
  newPateintsPrevious: number = 0;
  returningPateintsPrevious: number = 0;
  previous_cases: number = 0;
  isNewPatientPositive: boolean;
  isReturningPatientsPositive: boolean;
  isNewCasesPositive: boolean;

  step: number = 5;
  no_of_days: any[] = [];
  xLabels: any = [];

  yLabels: any;
  labels: any;

  dataLength: number;
  dataLabels: Array<string> = [];
  datasets: any;
  chartData: any;
  finalizedData: any;
  unfinalizedData: any;
  visitTimeline: any;
  billedData: any;
  casetype: any;
  unfinalizedvisit: any;
  visitDate: any[] = [];

  denialLabels: string[] = [];
  denialData: any[] = [];
  denialLabelsData: number[] = [];
  denialLabelCounts: number[] = [];
  visitLabels: any[] = [];

  selectedFilters: any;
  htttpRequests: any[] = [];
  date_difference: any;
  denialTypeColors: Array<string> = ['#656EB8', '#32639A', '#3653D3', '#40488C', '#568BC8', '#89A0FA', '#56A5F1', '#69D2F2', '#B0BFFC', '#B3D7FA'];
  //// Subsscriptions
  subscriptionsList: Array<Subscription> = [];
  date: any;
  pageTitle: string = "";
  screenHeight: any;
  screenWidth: any;
  averageGraphHeight: any;
  averageGraphWidth: any;
  averageGraphFont: string = `bolder 1.1em roboto`;
  heightSet: Boolean = false;
  patientDataAssigned: Boolean = false;
  bigscreen: Boolean = false;
  logedInUserType: any;
  userType = RoleType;
  dashboard = Dashboard;
  constructor(private authService: AuthService, private mainService: MainService,private router: Router, private storageData: StorageData, private ngbModal: NgbModal, private analyticsService: AnalyticsService, private titleService: Title, private route: ActivatedRoute) {
    this.onResize();
  }
  onResize() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    if (this.screenWidth >= 1030) {
      if (this.screenWidth > 1700) {
        this.bigscreen = true
      }
      this.averageGraphHeight = 178;
      this.averageGraphWidth = 246;
      this.heightSet = true;
    } else if (this.screenWidth < 1030) {
      this.averageGraphHeight = 130;
      this.averageGraphWidth = 150;
      this.averageGraphFont = `bolder 0.75em roboto`;
      this.heightSet = true;
    }

  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getPatientCasesData(this.filters)
  }
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
    this.pageTitle = this.route.snapshot.data['title'] ? this.route.snapshot.data['title'] : "Dashboard";
    this.titleService.setTitle('Ovada' + '-' + this.pageTitle);
    Chart.defaults.datasets.bar.barThickness = 12;
    this.mainService.setLeftPanel({});
    if (!this.storageData.getFacilityLocations().length && this.storageData.getUserId() != 0) {
      var modalRef = this.ngbModal.open(ChooseFacilityComponent, { backdrop: 'static' });
    }

    if (!this.storageData.getUserTimeZone()) {
      this.storageData.setUserTimeZone(setDefaultTimeZone())

    }
    window.addEventListener('resize', (event) => {
      this.destroyAndRerenderAllCanvas();

    }, true);


  }
 
  ngOnDestroy(): void {
    this.subscriptionsList?.forEach((subscription: Subscription) => {
      subscription?.unsubscribe();
    });
  }
  fetchVisitStatusData(filters: any) {
    return new Promise((resolve, reject) => {
      let visitStatusSubscription = this.analyticsService.post(AnalyticsUrlsEnum.Visits_List, filters).subscribe(
        (response) => {
          const visit = response.result.data
          if (visit && isArray(visit)) {
            this.visitTimeline = visit.map((item) => item.Visit_Timeline);

            this.finalizedData = visit.map((item) => item.finalized);

            this.unfinalizedData = visit.map((item) => item.un_finalized);

            this.billedData = visit.map((item) => item.bill_created);

            this.visitLabels = visit.map((item) => item.Visit_Timeline);

            resolve(true);
          } else {
            resolve(false);
          }

        },
        (error) => {
          resolve(false);
        }
      );
      this.subscriptionsList.push(visitStatusSubscription);
    })

  }

  fetchbillStatusData(filters: any) {
    return new Promise((resolve, reject) => {
      let billStatusSubscription = this.analyticsService.post(AnalyticsUrlsEnum.bills_List, filters).subscribe(
        (response) => {
          const bill = response.result.data
          if (bill) {
            const daysDifference = bill.map((item: any) => item.date_difference);
            const unfinalizedVisits = bill.map((item: any) => item.unfinalized_visit);

            const mergedData = daysDifference.map((x: any, index: number) => ({
              x: x,
              y: unfinalizedVisits[index]
            }));
            let ninetyPlus = 0;
            mergedData.forEach((item: any) => {
              if (item.x > 90) {
                ninetyPlus += Number(item.y)
              }
            })
            function groupData(data) {
              const groupedData = [];
              const maxRange = Math.min(Math.max(...data.map(point => point.x)), 90);
              let i = 0;
              while (i < maxRange) {
                let step = 5;
                if (i >= 30) {
                  step = 10;
                }
                const filteredPoints = data.filter(point => point.x >= i && point.x < i + step);
                const sumY = filteredPoints.reduce((acc, val) => acc + Number(val.y), 0);
                groupedData.push({ x: i + '-' + (i + step), y: sumY });

                i += step;
              }
              return groupedData;
            }
            const processedData = groupData(mergedData);
            this.xLabels = processedData.map((item: any) => item.x);
            const ninetyPlusLabel = '90+';
            this.xLabels.push(ninetyPlusLabel)
            this.yLabels = processedData.map((item: any) => item.y);
            this.yLabels.push(ninetyPlus)
            resolve(true)
          }
          resolve(true);
        },
        (error) => {
          resolve(false);
          }
      );
      this.subscriptionsList.push(billStatusSubscription);
    })
  }

  resetAssignmentAnalysisVariables() {
    this.completedData = [];
    this.scheduledData = [];
    this.cancelledData = [];
    this.appointmentLabel = [];
    this.totalAppointments = 0;
    this.scheduledTotal = 0;
    this.completedTotal = 0;
    this.cancelledTotal = 0;
    this.noShowTotal = 0;
    this.rescheduledTotal = 0;
    this.completedPercent = 0;
    this.scheduledPercent = 0;
    this.rescheduledPercent = 0;
    this.noShowPercent = 0;
    this.cancelledPercent = 0;
  }


  getAppointmentAnalysisData(filters) {
    return new Promise((resolve, reject) => {
      let appointmentSubscription = this.analyticsService.post(AnalyticsUrlsEnum.Apppointment_Trends, filters).subscribe((response) => {
        const res = response.result.data;
        const iterableData = res?.granular_data;
        this.resetAssignmentAnalysisVariables();
        if (res && iterableData?.length > 0) {
          iterableData.forEach((item) => {
            if (item.completed) {
              this.completedData.push(item.completed);
            }
            if (item.Scheduled) {
              this.scheduledData.push(item.Scheduled);
            }
            if (item.Cancelled_Noshows) {
              this.cancelledData.push(item.Cancelled_Noshows);
            }
            if (!(item.completed)) {
              this.completedData.push(0);
            }
            if (!(item.Scheduled)) {
              this.scheduledData.push(0);
            }
            if (!(item.Cancelled_Noshows)) {
              this.cancelledData.push(0);
            }
            this.appointmentLabel.push(item.date_label)
          });
          this.totalAppointments = res['Total Appointments'];
          this.scheduledTotal = res['scheduled']
          this.completedTotal = res['completed'];
          this.cancelledTotal = res['Cancelled'];
          this.noShowTotal = res['no_show'];
          this.rescheduledTotal = res['re_scheduled'];
          this.completedPercent = +(this.completedTotal / this.totalAppointments * 100).toFixed(2);
          this.scheduledPercent = +(this.scheduledTotal / this.totalAppointments * 100).toFixed(2);
          this.rescheduledPercent = +(this.rescheduledTotal / this.totalAppointments * 100).toFixed(2);
          this.noShowPercent = +(this.noShowTotal / this.totalAppointments * 100).toFixed(2);
          this.cancelledPercent = +(this.cancelledTotal / this.totalAppointments * 100).toFixed(2);
          resolve(true);
        } else {
          resolve(false);
        }
      }, error => {
        resolve(false);
      });
      this.subscriptionsList.push(appointmentSubscription);
    })

  }
  getGapDurationData(filters) {
    return new Promise((resolve, reject) => {
      let durationSubscription = this.analyticsService.post(AnalyticsUrlsEnum.Gap_Duration, filters).subscribe((response) => {
        const res = response.result.data;
        if (res) {
          this.avgGap = res[0].average_gap_days;
          this.minGap = res[0].minimum_gap_days;
          this.maxGap = res[0].maximum_gap_days;
          this.avgDuration = res[0].average_duration_time;
          this.minDuration = res[0].minimum_duration_time;
          this.maxDuration = res[0].maximum_duration_time;
          resolve(true);
        } else {
          resolve(false);
        }
      }, error => {
        resolve(false);
      });
      this.subscriptionsList.push(durationSubscription);
    })

  }
  getPatientCasesData(filters) {
    return new Promise((resolve, reject) => {
      this.patientDataAssigned = false;
      let patientCaseSubscription = this.analyticsService.post(AnalyticsUrlsEnum.Patient_Trends, filters).subscribe((response) => {
        const res = response.result.data;
        if (res) {
          this.newPatients = res.newPatients;
          this.newPatientsChanged = res.newPatientChanged;
          this.newPateintsPrevious = res.newPateintsPrevious;
          this.isNewPatientPositive = res.newPatientIsPositive;
          this.returningPatients = res.returningPatients;
          this.returningPatientsChanged = res.returningPatientsChanged;
          this.returningPateintsPrevious = res.returningPateintsPrevious;
          this.isReturningPatientsPositive = res.returningPatientsIsPositive;
          this.newCases = res.newCases;
          this.previous_cases = res.previousCases;
          this.newCasesChanged = res.newCasesChanged;
          this.isNewCasesPositive = res.newCasesIsPositive
          this.patientDataAssigned = true;
          resolve(true);
        } else {
          resolve(false);
        }
      }, error => {
        resolve(false)
      });
      this.subscriptionsList.push(patientCaseSubscription);
    })
  }


  onCaptureFilterSelectEvent(filtersValue: any) {
    this.filters = filtersValue.filters;
    this.dataLength = filtersValue.dataLength;
    this.dataLabels = filtersValue.labels;
    this.onLoadDashboardData();

  }
  onLoadDashboardData() {
    this.loadSpin = true;
    this.htttpRequests.push(this.fetchbillStatusData(this.filters));
    this.htttpRequests.push(this.fetchVisitStatusData(this.filters));
    this.htttpRequests.push(this.getGapDurationData(this.filters));
    this.htttpRequests.push(this.getAppointmentAnalysisData(this.filters));
    this.htttpRequests.push(this.getPatientCasesData(this.filters));
    this.htttpRequests.push(this.createdenialTypeAnalysisChart(this.filters))
    Promise.all(this.htttpRequests).then((succes) => {

      this.loadSpin = false;
      this.destroyAndRerenderAllCanvas();

    }).catch(error => {
      this.loadSpin = false;
    });
  }
  createAppointmentAnalysisChart() {
    this.appointmentTrendsAnalysisChart = new Chart('appointmentTrendsAnalysisCanvas', {
      type: 'bar',
      data: {
        labels: this.appointmentLabel,


        datasets: [
          {
            label: 'Completed Appointments',
            data: this.completedData,

            barThickness: 6,
            backgroundColor: '#3C76B9',
            order: 1,
            datalabels: {
              display: false
            },
            borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
            borderSkipped: false,

          },
          {
            label: 'Scheduled Appointments',
            data: this.scheduledData,
            barThickness: 6,
            backgroundColor: '#CAD4FD ',
            order: 2,
            datalabels: {
              display: false
            },
            borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
            borderSkipped: false,
          },
          {
            barThickness: 6,
            label: 'Canceled + No Shows',
            data: this.cancelledData,
            backgroundColor: '#252950  ',


            order: 0,
            datalabels: {
              display: false
            },

            borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6 },
            borderSkipped: false,
          },
        ],


      },
      options: {
        hover: { mode: null },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,

            stacked: true,
            title: {
              display: true,
              text: 'Appointments Count',
              font: {
                weight: 'bold'
              }
            },

            grid: {
              display: false
            }
          },
          x: {
            stacked: true,
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              boxWidth: 20, // Set a fixed width for each legend item
            },
            position: 'bottom',
          },
        },
      },
    });
  }

  createVisitstatuschart() {
    this.visitStatusAnalysisChart = new Chart('visitStatusAnalysisCanvas', {
      type: 'line',
      data: {
        labels: this.visitLabels,


        datasets: [
          {
            label: 'Finalized Visits',
            data: this.finalizedData,

            borderWidth: 2,
            backgroundColor: '#284F7B',
            borderColor: '#284F7B',
            order: 1,
            cubicInterpolationMode: 'default',
            tension: 0.3,
          },
          {
            label: 'Billed Visits',
            data: this.billedData,
            borderWidth: 2,
            backgroundColor: '#2FA3AE',
            borderColor: '#2FA3AE',
            order: 2,
            cubicInterpolationMode: 'default',
            tension: 0.3,
          },
          {
            label: 'Unfinalized Visits',
            data: this.unfinalizedData,
            borderWidth: 2,
            backgroundColor: '#A0AEEA',
            borderColor: '#A0AEEA',
            order: 0,
            cubicInterpolationMode: 'default',
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        hover: { mode: null },

        scales: {
          y: {
            title: {
              display: true,
              text: 'Visit Count',
              font: {
                weight: 'bold'
              }
            },
            beginAtZero: true,
            stacked: false,
            grid: {
              display: false
            }
          },
          x: {
            stacked: true,
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',

          },

        },

      },
    });
  }
  createUnfinalizedDetailChart() {
    let truncatedData: string[], tooltipLabels: string[];
    ({ truncatedData, tooltipLabels } = customizedLabels(this.filters, this.yLabels));
    this.billStatusAnalysisChart = new Chart('billStatusAnalysisCanvas', {
      type: 'bar',
      data: {
        labels: ['0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90+'],
        datasets: [{
          label: 'Unfinalized Visits',
          data: truncatedData,
          backgroundColor: [
            'rgb(153, 204, 255)'
          ]
          ,
          barThickness: 7,
          borderWidth: 1,
          borderRadius: 7,

        }]
      },
      options: {
        responsive: true,
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
            display: false // Remove labels on each bar
          },
        },
        scales: {
          x: {
            ticks: {
              font: {
                weight: 'bold',
                size: 12,
              }
            },
            grid: {
              display: false
            },
            title: {
              display: true,
              text: 'No. of Days',
              font: {
                weight: 'bold'
              }
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              display: false
            },
            title: {
              display: true,
              text: 'Unfinalized Visits Count',
              font: {
                weight: 'bold'
              }
            },
          },
        },
      }
    });

  }

  redenderGraphs() {
    this.denialTypeAnalysisChart = new Chart('denialType', {
      type: 'doughnut',

      data: {
        labels: this.denialLabels,
        datasets: [
          {
            data: this.denialLabelsData,
            borderWidth: 1,
            backgroundColor: this.denialTypeColors,
            order: 1
          },
        ],
      },
      options: {

        hover: { mode: null },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',

            display: false
          },

          tooltip: {
            position: 'average',
            xAlign: 'left',
            yAlign: 'top',
            titleSpacing: 10,

            titleMarginBottom: 20,
            callbacks: {
              label: (function (context) {
                let label = context.label;

                let percentage: any = context.formattedValue + '%';
                if (!label)
                  label = 'Unknown'

                let sum = 0;
                let dataArr = context.chart.data.datasets[0].data;
                dataArr.map(data => {
                  sum += Number(data);
                });
                let value = this.denialLabelCounts[context.dataIndex];
                return `+${value}` + " " + `(${percentage})`;
              }).bind(this)
            },

          }
        },
      },

    });
    Chart.register(ArcElement);
    this.createAvgGapGraph();
    this.createAvgAppointmentGraph();
    this.createAppointmentAnalysisChart();
    this.createVisitstatuschart();
    this.createUnfinalizedDetailChart();
  }
  createAvgGapGraph() {
    var avgGap = this.avgGap ? Number(this.avgGap) : 0;

    var chartData = {
      datasets: [
        {
          data: [1],
          backgroundColor: (context) => {
            const { ctx, chartArea } = context.chart;
            if (!chartArea) return;

            const gradientSegment = ctx.createLinearGradient(
              chartArea.left,
              0,
              chartArea.right,
              0
            );
            gradientSegment.addColorStop(0, "#35B5C0");
            gradientSegment.addColorStop(0.5, "#E6820F");
            gradientSegment.addColorStop(1, "#E93C10");

            return gradientSegment;
          },
          borderWidth: 0,
          borderRadius: [20]
        }
      ]
    };

    const options = {
      circumference: 180,
      rotation: -90,
      cutout: "92%",
      responsive: false,
      maintainAspectRatio: true,
      aspectRatio: 1.5,
      animation: {
        animateRotate: true
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },

      }
    };

    var guageNeedle = {
      id: "guageNeedle",
      afterDatasetsDraw: (chart) => {
        const {
          ctx,
          chartArea: { width }
        } = chart;
        ctx.save();

        const angle = avgGap > 0 ? (Math.PI + (1 / this.maxGap) * avgGap * Math.PI) : (Math.PI + (1 / this.maxGap) * 2 * Math.PI);
        const cx = width / 2;
        const cy = chart._metasets[0].data[0].y;

        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.lineTo(cx, 0);
        ctx.lineTo(0, 3);
        ctx.fillStyle = "#5A5A5A";
        ctx.fill();
        ctx.rotate(-angle);

        ctx.translate(-cx, -cy);
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, 10);
        ctx.fill();
        ctx.restore();
      }
    };

    var speedLabel = {
      id: "speedLabel",
      afterDatasetsDraw: (chart) => {
        const { ctx } = chart;

        var data = chart._metasets[0].data[0];
        var centerX = data.x;
        var centerY = data.y;

        ctx.fillStyle = "#5A5A5A";
        ctx.font = this.averageGraphFont;
        ctx.textAlign = "center";
        ctx.fillText(`${avgGap} Days`, centerX, centerY + 24);
      }
    };

    this.averageGapChartRef = new Chart('averageGapChart', {
      type: 'doughnut',
      plugins: [speedLabel, guageNeedle],
      data: chartData,
      options: options
    });
  }
  createAvgAppointmentGraph() {
    var avgDuration = this.avgDuration ? Number(this.avgDuration) : 0;

    var chartData = {
      datasets: [
        {
          data: [1],
          backgroundColor: (context) => {
            const { ctx, chartArea } = context.chart;
            if (!chartArea) return;

            const gradientSegment = ctx.createLinearGradient(
              chartArea.left,
              0,
              chartArea.right,
              0
            );
            gradientSegment.addColorStop(0, "#35B5C0");
            gradientSegment.addColorStop(0.5, "#E6820F");
            gradientSegment.addColorStop(1, "#E93C10");
            return gradientSegment;
          },
          borderWidth: 0,
          borderRadius: [20]
        }
      ]
    };

    const options = {
      circumference: 180,
      rotation: -90,
      cutout: "92%",
      responsive: false,
      maintainAspectRatio: true,
      aspectRatio: 1.5,
      animation: {
        animateRotate: true
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },

      }
    };

    var guageNeedle = {
      id: "guageNeedle",
      afterDatasetsDraw: (chart) => {
        const {
          ctx,
          chartArea: { width }
        } = chart;
        ctx.save();

        const angle = avgDuration > 0 ? (Math.PI + (1 / 100) * avgDuration * Math.PI) : (Math.PI + (1 / 100) * 2 * Math.PI);

        const cx = width / 2;
        const cy = chart._metasets[0].data[0].y;

        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.lineTo(cx, 0);
        ctx.lineTo(0, 3);
        ctx.fillStyle = "#5A5A5A";
        ctx.fill();
        ctx.rotate(-angle);

        ctx.translate(-cx, -cy);
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, 10);
        ctx.fill();
        ctx.restore();
      }
    };

    var speedLabel = {
      id: "speedLabel",
      afterDatasetsDraw: (chart) => {
        const { ctx } = chart;

        var data = chart._metasets[0].data[0];
        var centerX = data.x;
        var centerY = data.y;

        ctx.fillStyle = "#5A5A5A";
        ctx.font = this.averageGraphFont;
        ctx.textAlign = "center";
        ctx.fillText(`${avgDuration} Mins`, centerX, centerY + 24);
      }
    };
    this.averageAppointmentGapChartRef = new Chart('averageAppointmentGapChart', {
      type: 'doughnut',
      plugins: [speedLabel, guageNeedle],
      data: chartData,
      options: options
    });
  }
  async destroyAndRerenderAllCanvas() {
    await this.appointmentTrendsAnalysisChart?.destroy();
    await this.billStatusAnalysisChart?.destroy();
    await this.visitStatusAnalysisChart?.destroy();
    await this.denialTypeAnalysisChart?.destroy();
    await this.averageGapChartRef?.destroy();
    await this.averageAppointmentGapChartRef?.destroy();

    this.redenderGraphs();
  }

  //// denial type
  createdenialTypeAnalysisChart(filters) {
    return new Promise((resolve, reject) => {
      let denialTypeSibscription = this.analyticsService.post(AnalyticsUrlsEnum.Denial_Types, filters).subscribe((response) => {
        if (response && (response.length != 0) && response.result?.data) {
          this.denialLabels = [...response['result']['data']['labels']];
          this.denialLabelsData = [...response['result']['data']['labelPercentage']];
          this.denialLabelCounts = [...response['result']['data']['labelVals']];
          this.denialData = [...response['result']['data']['fullData']];
          this.denialData.forEach((data, index) => {
            data.bgColor = this.denialTypeColors[index];
          });
          resolve(true);
        } else {
          resolve(false);
        }
      }, error => {
        resolve(false)
      });
      this.subscriptionsList.push(denialTypeSibscription);
    });
  }
  getIconClass(isPositive: boolean, value: number): string {
    if (value != 0) {
      return isPositive ? 'fa fa-solid fa-arrow-up' : 'fa fa-solid fa-arrow-down'
    }
    return '';
  }
  getColorClass(isPositive: boolean, value: number) {
    if (value != 0) {
      return isPositive ? 'patient-icon-green' : 'patient-icon-red'
    }
    return 'patient-icon-grey';
  }
  AppointmentExport() {
    const [chartName, fileName] = chartNames.AppointmentTrends.split(',');
    this.exportCommonFunction(chartName, fileName)
  }
  UnfianlizedVisitExport() {
    const [chartName, fileName] = chartNames.UnfinalizedVisits.split(',');
    this.exportCommonFunction(chartName, fileName)
  }
  denialTypeAnalysis() {
    const [chartName, fileName] = chartNames.DenialTypeAnalysis.split(',');
    this.exportCommonFunction(chartName, fileName)
  }
  averageCount() {
    const [chartName, fileName] = chartNames.AverageCount.split(',');
    this.exportCommonFunction(chartName, fileName)
  }
  visitStatusAnalysis() {
    const [chartName, fileName] = chartNames.VisitStatusAnalysis.split(',');
    this.exportCommonFunction(chartName, fileName)
  }
  patientStatus() {
    const [chartName, fileName] = chartNames.patientCaseStatus.split(',');
    this.exportCommonFunction(chartName, fileName)
  }
  returningPatientStatus() {
    const [chartName, fileName] = chartNames.returningPatientCaseStatus.split(',');
    this.exportCommonFunction(chartName, fileName)
  }
  newCasesExport() {
    const [chartName, fileName] = chartNames.newCases.split(',');
    this.exportCommonFunction(chartName, fileName)
  }
  showProgressModal() {
    const modalElement = document.getElementById('progressModal') as HTMLElement;
    if (modalElement) {
      modalElement.style.display = 'block';
    }
  }
  hideProgressModals() {
    const modalElement = document.getElementById('progressModal') as HTMLElement;
    if (modalElement) {
      modalElement.style.display = 'none';
    }
  }
  exportCommonFunction(chartName: string, fileName: string) {
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
        this.analyticsService.post(AnalyticsUrlsEnum.PM_EXPORT_API, newFilters).subscribe(
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
    });
}
}















