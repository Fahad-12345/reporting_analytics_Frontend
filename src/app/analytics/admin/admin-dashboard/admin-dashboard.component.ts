import { Component, OnInit } from '@angular/core';

import { AnalyticsService } from '@appDir/analytics/analytics.service';
import { CaseWiseDropDown, GraphType } from '@appDir/analytics/helpers/CaseWise.enum';
import { DropDownOptionsList, PaymentWiseDropDown, PaymentWiseDropDownName, HighestPayingDropDown } from '@appDir/analytics/helpers/PaymentWise.enum';
import { AnalyticsUrlsEnum } from '@appDir/analytics/helpers/analytics_Urls_enum';
import { CurrencyPipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute,Router } from '@angular/router';
import { ChooseFacilityComponent } from '@appDir/front-desk/components/choose-facility/choose-facility.component';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { MainService } from '@appDir/shared/services/main-service';
import { isArray, setDefaultTimeZone } from '@appDir/shared/utils/utils.helpers';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';
import { AuthService } from '@appDir/shared/auth/auth.service';
import { Dashboard, RoleType } from '@appDir/analytics/helpers/role.enum';
import { convertToCsv, updateRandomProgress } from '@appDir/analytics/shared/export-csv';
import { chartNames } from '@appDir/analytics/helpers/charts.enum';
import { bottom } from '@popperjs/core';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  billedAmountChart: any;
  caseWiseDetailChart: any;
  amountCaseWiseTypeChart: any;
  billedBySpecialtyChart: any;
  highestPayingInsuranceChart: any;
  claimsReviewChart: any;
  revenueByLocationChart: any;
  dataLength: number = 7;
  dataLabels: Array<string> = [];
  htttpRequests: any[] = [];
  loadSpin: boolean = false;
  billingAmountType: string = "Specialities";
  specialityTitle: string = "Specialities";
  specialitiesdata: Array<any> = [];
  copySpecialitiesdata: Array<any> = [];
  specialitesColors: string[] = ['#656EB8', '#3C76B9', '#30A5B0', '#1D88ED', '#56A5F1', '#68D2F3', '#A1E3F7', '#A0AEEA', '#CAD4FD', '#C7EEFA'];
  claimOverViewColors: string[] = ['#8693d1','#A0AEEA', '#68D2F3', '#56A5F1', '#1D88ED', '#2FA3AE', '#3C76B9', '#252950', '#526ad2', '#8693d1', '#A0AEEA','#68D2F3', '#56A5F1', '#1D88ED', '#2FA3AE'];
  claimOverViewRowsData: any[] = [];
  claimOverViewColumns: string[] = ['Claim Status', 'No.of Claims', 'Amount of Claims', '% of Total CLaims'];
  // CaseWiseSumOfAmounts
  caseWiseChartData: any[] = [];
  caseWiseChartLabels : any[] = [];
  genericPayerData: [] = [];
  SelectedPayer: [] = [];
  selectedHighestPayer: number = 2;
  chooseValueSumofAmounts: CaseWiseDropDown = 0;
  chooseValueClaims: PaymentWiseDropDown = 0;
  chooseValueBvP: PaymentWiseDropDown = 0;
  highestPayerColumn = ['Name','No. of Bills','Total Amount']
  filters: any;
  highestPayingFilter: any
  dropDownFlagBvP : Boolean = true;
  dropDownFlagAmounts : Boolean = true;
  dropDownFlagClaims : Boolean = true;
  pageTitle:string = "";
  isUserDoctor: Boolean = false;
  // CaseWiseSumOfAmountsEnd
  billedvsPaymentLabels :any [];
  
  totalBilledAmount : number = 0;
  totalPaymentReceived : number = 0;
  logedInUserType: any;

  // ClaimsOverview
  
 
  showBilledValue : Boolean = false;
  billed: number = 0;
  paidPercent: number = 100;
  TotalAmount: number = 0;
  speciality_ids: any[] = [];
  // ClaimsOverviewEnd
  //billed vs received 
  billedBackgroundColor : string = '#A1E3F7';
  paymentBackgroundColor : string = '#3C76B9';
  invoicePaymentBackgroundColor : string = '#30A5B0';
  invoiceBackgroundColor : string = '#8693d1';
  
  billedAmountVsReceivedAmountChartData: any[] = [];
  //billed vs recieved end
  //received
  //RevenueByLocation
  revenueData: any[] = [];
  dropDownOptions = DropDownOptionsList();
  userType = RoleType;
  dashboard = Dashboard;

  //RevenueByLocationEns
  //// Subsscriptions
  subscriptionsList: Array<Subscription> = [];
  obj: any;
  casewise: any;
  bilvsPay: any;
  claims: number;
  constructor(private authService: AuthService,private mainService: MainService,private router: Router, private storageData: StorageData, private ngbModal: NgbModal, private analyticsService: AnalyticsService, private currencyPipe: CurrencyPipe,private titleService : Title,private route : ActivatedRoute) {

  }
  ngOnInit(): void {
    this.logedInUserType = this.authService.getUserType();
    this.isUserDoctor = this.storageData.isDoctor();
    this.pageTitle = this.route.snapshot.data['title'] ? this.route.snapshot.data['title'] : "Dashboard";
    this.titleService.setTitle('Ovada' +'-'+ this.pageTitle);
    Chart.defaults.datasets.bar.barThickness = 8;
    this.mainService.setLeftPanel({});
    if (!this.storageData.getFacilityLocations().length && this.storageData.getUserId() != 0) {
      var modalRef = this.ngbModal.open(ChooseFacilityComponent, { backdrop: 'static' })
      modalRef.result.then((res) => {
        // this.logout()

      })

    }

    if (!this.storageData.getUserTimeZone()) {
      this.storageData.setUserTimeZone(setDefaultTimeZone())

    }
    Chart.register(ChartDataLabels);

    this.destroyAndCreateChartCanvas();
    window.addEventListener('resize', (event) => {
      this.destroyAndCreateChartCanvas();

    }, true);
  }
  ngOnDestroy(): void {
    this.subscriptionsList?.forEach((subscription: Subscription) => {
      subscription?.unsubscribe();
    });
  }
  async destroyAndCreateChartCanvas() {
    await this.billedAmountChart?.destroy();
    await this.caseWiseDetailChart?.destroy();
    await this.amountCaseWiseTypeChart?.destroy();
    await this.billedBySpecialtyChart?.destroy();
    this.createAdminDashboardCharts();
  }
  onSelectTopTenBillingAmountType() {

    this.specialityTitle = this.billingAmountType;
    this.getTopSpecialities(this.filters);
  }
  showBilled(location: any) {
    location.showBilledValue = true;
  }

  hideBilled(location: any) {
    location.showBilledValue = false;
  }
  setTopBillingDataToChart() {
    if (this.billingAmountType == 'Specialities') {
      this.specialityTitle = "Specialities";
      let specsData = this.copySpecialitiesdata;
      specsData = specsData.filter((speciality) => speciality?.speciality_name !== null);
      this.specialitiesdata = specsData?.map((x, index) => {
        return {
          name: x.speciality_name,
          amount: x.bill_amount,
          backGroundColor: this.specialitesColors[index]
        }
      
      });
      
    } else if (this.billingAmountType == 'Providers') {
      this.specialityTitle = "Providers";
      let providerData = this.copySpecialitiesdata;
      providerData = providerData.filter((provider) => provider?.provider_name !== null);
      this.specialitiesdata = providerData?.map((x, index) => {
        return {
          name: x.provider_name,
          amount: x.provider_bill_amount,
          backGroundColor: this.specialitesColors[index]
        }
      });
    }
    this.billedBySpecialtyChart?.destroy();
    this.createSpecialityChart();
  }
  getcaseWiseTypeData(filters, dropdown: number) {
    const obj = JSON.parse(JSON.stringify(filters)) as typeof filters;
    this.casewise =  obj.recipient_id = dropdown;
    return new Promise((resolve, reject) => {
      let caseWiseSubscription = this.analyticsService.post(AnalyticsUrlsEnum.Sum_Amounts,obj).subscribe((response) => {
        const res = response.result.data;

        if (res ) {
          this.caseWiseChartData = [];
          this.caseWiseChartLabels = [];
          Object.keys(res).forEach(key => {
            this.caseWiseChartLabels.push(key)  
            this.caseWiseChartData.push(res[key]);  
        });
        }
        resolve(true);
      }, error => {
        reject(error);
      });
      this.subscriptionsList.push(caseWiseSubscription);
    })
  }
  getbilledvsreceived(filters, dropdown: number) {
    const obj = JSON.parse(JSON.stringify(filters)) as typeof filters;
    this.bilvsPay = obj.recipient_id = dropdown;
    return new Promise((resolve, reject) => {
      let billedReceivedSubscription = this.analyticsService.post(AnalyticsUrlsEnum.billed_Received, obj).subscribe((response) => {
        const res = response?.result?.data;
        if (res && isArray(res)) {
          this.totalBilledAmount = 0;
          this.totalPaymentReceived = 0;
          this.billedvsPaymentLabels = res.map((item?: any) =>  item?.bill_date);
          this.billedAmountVsReceivedAmountChartData = res;
          this.billedAmountVsReceivedAmountChartData?.forEach((item?:any) => {
            this.totalBilledAmount += Number(item?.original_billed_amount)
            this.totalPaymentReceived += Number(item?.payment_received)
          })
        }
        resolve(true);
      }, error => {
        reject(error);
      });
      this.subscriptionsList.push(billedReceivedSubscription);
    })
  }
  getRevenueLocations(filters) {
    return new Promise((resolve, reject) => {
      let revenueByLocationSubscription = this.analyticsService.post(AnalyticsUrlsEnum.Revenue_Locations, filters).subscribe((response) => {
        const res = response.result.data;
        if (res && isArray(res)) {
          this.revenueData = res;
          this.revenueData.forEach((item)=>{
            item.showBilledValue = false
          })
        }
        resolve(true);
      }, error => {
        reject(error);
      });
      this.subscriptionsList.push(revenueByLocationSubscription);
    })
  }

  getClaimsOverviewData(filters , dropdown: number) {
    const obj = JSON.parse(JSON.stringify(filters)) as typeof filters;
    this.claims = obj.recipient_id = dropdown;
    return new Promise((resolve, reject) => {
      let claimOverviewSubscription = this.analyticsService.post(AnalyticsUrlsEnum.Claims_Overview, obj).subscribe((response) => {
        const res = response.result.data
        if (res) {
          this.billed = res?.billed_amount;
          this.TotalAmount = res?.total_amount;
          this.paidPercent = res?.paidPercentage;
          this.claimOverViewRowsData = res?.Claims;
          this.claimOverViewRowsData.forEach((claim, index) => {
            claim.color = this.claimOverViewColors[index];
            claim.amountOfClaim = this.currencyPipe?.transform(claim?.amountOfClaim, '$');
            claim.percentage = claim?.percentage + '%';
          });
        }
        resolve(true);
      }, error => {
        reject(error);
      });
      this.subscriptionsList.push(claimOverviewSubscription);
    })
  }
  onDropDownSelect(value: string, type: number) {
    if (type == GraphType?.BillsvsPayments) {
    this.dropDownFlagBvP = false;}
    else if (type == GraphType?.AccountReceiveables){
    this.dropDownFlagAmounts = false;
    } 
    else if(type == GraphType?.ClaimsOverview){
      this.dropDownFlagClaims = false
    }
    switch (value) {
      case PaymentWiseDropDownName?.Patient:
        if(type == GraphType?.AccountReceiveables){
        this.chooseValueSumofAmounts = CaseWiseDropDown?.Patient;
        }else if(type == GraphType?.BillsvsPayments ){
        this.chooseValueBvP = PaymentWiseDropDown?.Patient;
        } else if(type == GraphType?.ClaimsOverview){
          this.chooseValueClaims = PaymentWiseDropDown?.Patient
        }
        break;
      case PaymentWiseDropDownName?.Employer:
        if(type == GraphType?.AccountReceiveables){
        this.chooseValueSumofAmounts = CaseWiseDropDown?.Employer;
        }else if(type == GraphType?.BillsvsPayments  ){
        this.chooseValueBvP = PaymentWiseDropDown?.Employer;
        }
        else if(type == GraphType?.ClaimsOverview){
          this.chooseValueClaims = PaymentWiseDropDown?.Employer
        }
        break;
      case PaymentWiseDropDownName?.Insurance:
        if(type == GraphType?.AccountReceiveables){
        this.chooseValueSumofAmounts = CaseWiseDropDown?.Insurance;
        }else if(type == GraphType?.BillsvsPayments  ){
        this.chooseValueBvP = PaymentWiseDropDown?.Insurance;
        }
        else if(type == GraphType?.ClaimsOverview){
          this.chooseValueClaims = PaymentWiseDropDown?.Insurance
        }
        break;
      case PaymentWiseDropDownName?.LawFirm:
        if(type == GraphType?.AccountReceiveables){
        this.chooseValueSumofAmounts = CaseWiseDropDown?.LawFirm;
        }else if(type == GraphType?.BillsvsPayments  ){
        this.chooseValueBvP = PaymentWiseDropDown?.LawFirm;
         }
         else if(type == GraphType?.ClaimsOverview){
          this.chooseValueClaims = PaymentWiseDropDown?.LawFirm
        }
        break;
      default:
        this.chooseValueSumofAmounts = 0;
        this.chooseValueBvP = 0;
        this.chooseValueClaims = 0;
    }
    if (type == GraphType?.AccountReceiveables) {
      this.getcaseWiseTypeData(this.filters, this.chooseValueSumofAmounts).then((succes) => {
        if (succes) {

          this.amountCaseWiseTypeChart?.destroy();

          this.createAmountCaseWiseTypeChart();
        }
      }).catch(error => {
      })
    } 
    else if (type == GraphType?.BillsvsPayments) {
      this.getbilledvsreceived(this.filters, this.chooseValueBvP).then((success) => {
        if (success) {

          this.billedAmountChart?.destroy();

          this.createBilledAmountChart();
        }
      }).catch(error => {
      });
    }
    else if (type == GraphType?.ClaimsOverview){
      this.getClaimsOverviewData(this.filters, this.chooseValueClaims)
    };
  }

  onCaptureFilterSelectEvent(filtersValue: any) {
    this.dataLength = filtersValue?.dataLength;
    this.dataLabels = filtersValue?.labels;
    this.filters = JSON.parse(JSON.stringify(filtersValue?.filters));
    this.speciality_ids = this.filters?.speciality_ids ? this.filters?.speciality_ids : []
    this.loadSpin = true;
    this.htttpRequests.push(this.getcaseWiseTypeData(filtersValue?.filters, this.chooseValueSumofAmounts));
    this.htttpRequests.push(this.getTopSpecialities(this.filters))
    this.htttpRequests.push(this.getClaimsOverviewData(filtersValue?.filters, this.chooseValueClaims));
    this.htttpRequests.push(this.createHighestPayerWiseChart({...filtersValue?.filters, recipient_id: this.selectedHighestPayer}));
    this.htttpRequests.push(this.getRevenueLocations(filtersValue?.filters));
    this.htttpRequests.push(this.getbilledvsreceived(filtersValue?.filters, this.chooseValueBvP));
    Promise.all(this.htttpRequests).then((succes) => {
      if (succes) {
        this.loadSpin = false;
        this.destroyAndCreateChartCanvas();
      }
    }).catch(error => {
      this.loadSpin = false;
    });
  }

  createBilledAmountChart() {
    this.billedAmountChart = new Chart('billAmountCanvas', {
      type: 'bar',
      data: {
        labels: this.billedvsPaymentLabels,
        datasets: [
         
          {
            label: 'Billed Amount',
            data: this.billedAmountVsReceivedAmountChartData && this.billedAmountVsReceivedAmountChartData?.length > 0 ?
              this.billedAmountVsReceivedAmountChartData?.map(data => data?.billed_amount) : [],
            backgroundColor: this.billedBackgroundColor,
            borderRadius: 8,
            stack: 'Stack 0' // Assigning to stack 0
          },
          {
            label: 'Invoice Amount',
            data: this.billedAmountVsReceivedAmountChartData && this.billedAmountVsReceivedAmountChartData?.length > 0 ?
              this.billedAmountVsReceivedAmountChartData?.map(data => data?.invoice_amount) : [],
            backgroundColor: this.invoiceBackgroundColor, // Define this color
            borderRadius: 8,
            stack: 'Stack 0' // Assigning to stack 0
          },
        
          {
            label: 'Payment Received',
            data: this.billedAmountVsReceivedAmountChartData && this.billedAmountVsReceivedAmountChartData?.length > 0 ?
              this.billedAmountVsReceivedAmountChartData?.map(data => data?.payment_received) : [],
            backgroundColor: this.paymentBackgroundColor,
            borderRadius: 8,
            stack: 'Stack 1' // Assigning to stack 1
          },
          {
            label: 'Invoice Payment Received',
            data: this.billedAmountVsReceivedAmountChartData && this.billedAmountVsReceivedAmountChartData?.length > 0 ?
              this.billedAmountVsReceivedAmountChartData?.map(data => data?.invoice_payment_received) : [],
            backgroundColor: this.invoicePaymentBackgroundColor, // Define this color
            borderRadius: 8,
            stack: 'Stack 1' // Assigning to stack 1
          },
          
        ],
      },
      options: {
        hover: { mode: null },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Amount in dollars ($)',
              font: {
                weight: 'bold'
              }
            },
            beginAtZero: true,
            stacked: true, // Change to true for stacked bars
            grid: {
              display: false
            },
          },
          x: {
            stacked: true, // Change to true for stacked bars
            grid: {
              display: false
            }
          }
        },
        plugins: {
          datalabels: {
            display: false,
          },
          legend: {
            position: 'bottom',
          },
        }
      },
    });
  }

  createAmountCaseWiseTypeChart() {
    this.amountCaseWiseTypeChart = new Chart('amountCaseWiseTypeCanvas', {
      type: 'bar',
      data: {
        labels: this.caseWiseChartLabels,
        datasets: [
          {
            label: 'Outstanding Bill Amount',
            data: this.caseWiseChartData && this.caseWiseChartData?.length > 0 ?
              this.caseWiseChartData?.map(data => data?.bill) : [],
            backgroundColor: 'rgb(120, 123, 250)', 
            borderWidth: 1,
            borderRadius: 7,
            stack: 'Stack 0', 
          },
          {
            label: 'Outstanding Invoice Amount',
            data: this.caseWiseChartData && this.caseWiseChartData?.length > 0 ?
              this.caseWiseChartData?.map(data => data?.invoice) : [],
            backgroundColor: 'rgb(255, 99, 132)',
            borderWidth: 1,
            borderRadius: 7,
            stack: 'Stack 0', 
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: true, 
            position: bottom
          },
          datalabels: {
            display: false 
          }
        },
        scales: {
          x: {
            stacked: true, 
            ticks: {
              font: {
                weight: 'bold',
                size: 10,
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
            stacked: true, 
            beginAtZero: true,
            grid: {
              display: false
            },
            title: {
              display: true,
              text: 'Total Amount $',
              font: {
                weight: 'bold'
              }
            },
          },
        },
      }
    });
  }
  

  createAdminDashboardCharts() {
    this.createBilledAmountChart();
    this.createAmountCaseWiseTypeChart();
    this.createSpecialityChart();
  }
  createSpecialityChart() {
    this.billedBySpecialtyChart = new Chart('billedBySpecialtyChartCanvas', {
      type: 'doughnut',

      data: {

        labels: this.specialitiesdata.map(x => x.name),
        datasets: [
          {

            data: this.specialitiesdata.map(x => x.amount),
            datalabels: {
              color: '#FFFFFF'
            },
            borderWidth: 1,
            backgroundColor: this.specialitesColors,
            order: 0,

          },

        ],

      },
      options: {
        hover: { mode: null },
        responsive: true,
        maintainAspectRatio: false,
       
        plugins: {
          tooltip: {

            callbacks: {
              label: function (context) {
                let label = context.label;
                context.formattedValue = context.formattedValue.replaceAll(",", "");
                let value = parseInt(context.formattedValue) as any;

                if (!label)
                  label = 'Unknown'

                let sum = 0;
                let dataArr = context.chart.data.datasets[0].data;
                dataArr.map(data => {
                  sum += Number(data);
                });

                let percentage: any = ((Number(value) / sum) * 100).toFixed(2) + '%';
                return `(${value})` + " : " + percentage;
              }
            }
          },
          datalabels: {
            color: '#FFFFFF',
            display: false
          },


          legend: {
            position: 'right',
            display: false,
          },

        },

      },
    });
  }
  /***Top 10 Specialities */
  getTopSpecialities(filters) {
    this.obj = JSON.parse(JSON.stringify(filters)) as typeof filters;
    return new Promise((resolve, reject) => {
      delete this.obj.recipient_id;
      if (this.billingAmountType == 'Specialities') {
        this.obj.speciality_ids = [];
      } else {
        this.obj.speciality_ids = this.speciality_ids;
      }
      this.analyticsService.post(AnalyticsUrlsEnum.Top_Specialities, this.obj,).subscribe((response) => {
        const res = response.result.data;
        this.specialitiesdata= [];
        if (res && res.length > 0) {
          this.specialitiesdata = res;
          this.copySpecialitiesdata = JSON.parse(JSON.stringify(res));
          this.setTopBillingDataToChart();
        }
        resolve(true);
        

      }, error => {
        resolve(false);
      });
    })
  }
  createHighestPayerWiseChart(filters) {
    return new Promise((resolve, reject) => {
      this.analyticsService.post(AnalyticsUrlsEnum.Highest_Payers, filters).subscribe((response) => {
        this.genericPayerData = []
        if (response && (response?.length != 0) && response?.result?.data) {
          this.genericPayerData = response?.result?.data; 
          this.genericPayerData?.forEach((element?: any) => {
              element.paid_amount = this.currencyPipe?.transform(element?.paid_amount, '$');
          })
          this.SelectedPayer['payer_type_name'] = HighestPayingDropDown[this.selectedHighestPayer];
          this.SelectedPayer['payer_data'] = this.genericPayerData;
          resolve(true);
        } else {
          resolve(false);
        }
      }, error => {
        resolve(false);
      })
    });

  }
  onDropDownHighestPayerSelect(value: string) {
    this.selectedHighestPayer = parseInt(value)
    if (this.selectedHighestPayer) {
      this.highestPayingFilter = { ...this.filters, recipient_id: this.selectedHighestPayer };
    }
    this.createHighestPayerWiseChart(this.highestPayingFilter)
  }
  calculateProgressBarValue(revenue: string, location_id): number {
    // const totalRevenue = this.revenueData.reduce((acc, entry) => acc + parseFloat(entry.revenue), 0);
    const totalRevenueObject = this.revenueData.find(item => item.facility_location_id === location_id);
    const totalRevenue = totalRevenueObject.billed_amount;
    let percentage = ((parseFloat(revenue) / totalRevenue) * 100);
    return percentage;
  }
  getProgressBarColor(facilityQualifier: string): string {
    switch (facilityQualifier) {
      case 'OPT':
        return '#F4A74D';
      case 'CM':
        return '#F4A74D';
      default:
        return '#F4A74D';
    }
  }


  billedvsRecivedPayment() {
    const [chartName, fileName] = chartNames.billedVsReceivedPayments.split(',');
    this.exportCommonFunction(chartName, fileName)
  }
  claimsOverview(){
    const [chartName, fileName] = chartNames.claimsOverview.split(',');
    this.exportCommonFunction(chartName, fileName)
  }
  topBillingSpecialities(){
   if (this.specialityTitle === "Specialities"){
    const [chartName, fileName] = chartNames.topBillingSpecialities.split(',');
    this.exportCommonFunction(chartName, fileName)
   } else if(this.specialityTitle === "Providers"){
    const [chartName, fileName] = chartNames.topBillingProviders.split(',');
    this.exportCommonFunction(chartName, fileName)
   }
  }
  highestPayer(){
    if(this.selectedHighestPayer == HighestPayingDropDown.Patient){
    const [chartName, fileName] = chartNames.higestPayerPatient.split(',');
    this.exportCommonFunction(chartName, fileName)
    }else if(this.selectedHighestPayer == HighestPayingDropDown.Employer){
      const [chartName, fileName] = chartNames.higestPayerEmployer.split(',');
      this.exportCommonFunction(chartName, fileName)
    }else if(this.selectedHighestPayer == HighestPayingDropDown.Insurance){
      const [chartName, fileName] = chartNames.higestPayerInsurance.split(',');
      this.exportCommonFunction(chartName, fileName)
    }else if(this.selectedHighestPayer == HighestPayingDropDown.Firm){
      const [chartName, fileName] = chartNames.higestPayerFirm.split(',');
      this.exportCommonFunction(chartName, fileName)
    }
    else{
      const [chartName, fileName] = chartNames.higestPayerInsurance.split(',');
      this.exportCommonFunction(chartName, fileName)
    }
  }
  accoutReceivableAging(){
    const [chartName, fileName] = chartNames.accountReceivableAging.split(',');
    this.exportCommonFunction(chartName, fileName)
  }
  revenueByLocation(){
    const [chartName, fileName] = chartNames.revenueByLocation.split(',');
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
    delete this.obj.recipient_id;
    let newFilters;
    switch (chartName) {
      case 'billedvsCheckAmount':
          this.obj.recipient_id = this.bilvsPay;
          break;
      case 'accountReceivableAging':
          this.obj.recipient_id = this.casewise;
          break;
      case 'claimsOverView':
          this.obj.recipient_id = this.claims;
          break;
      default:
          newFilters = { ...this.filters, chartName: chartName };
          return; 
  }
    newFilters = { ...this.obj, chartName: chartName };

    return new Promise((resolve, reject) => {
        const modalElement = document.getElementById('progressModal') as HTMLElement;
        const progressBar = document.getElementById('progressBar') as HTMLProgressElement;
        this.showProgressModal();
        let currentProgress = 0;
        const randomProgressInterval = setInterval(() => {
            currentProgress = updateRandomProgress(currentProgress, progressBar);
        }, 500);

        newFilters.disableLoaderForExports = true;
        this.analyticsService.post(AnalyticsUrlsEnum.admin_Export_API, newFilters).subscribe(
            (response) => {
                clearInterval(randomProgressInterval);
                const res = response?.result?.data;

                if (res && (Array.isArray(res) ? res?.length > 0 : true)) {
                    convertToCsv(res, fileName, modalElement, progressBar);
                } else {
                    throw new Error('No Data to Export');
                }
            },
            (error) => {
                clearInterval(randomProgressInterval);
                reject(error);
            }
        );
    });
}
}
