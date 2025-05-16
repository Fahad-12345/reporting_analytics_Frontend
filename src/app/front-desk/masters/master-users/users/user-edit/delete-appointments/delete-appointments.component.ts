import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { FacilityUrlsEnum } from '@appDir/front-desk/masters/practice/practice/utils/facility-urls-enum';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { NgbActiveModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { TemplateUrlsEnum } from '../template/template-urls-enum';
import { AppointmentUrlsEnum } from '@appDir/shared/modules/appointment/appointment-urls-enum';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { Subscription } from 'rxjs';
import { changeDateFormat, convertDateTimeForRetrieving, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { AppointmentCancelCommentModel } from '@appDir/scheduler-front-desk/modules/assign-speciality/modals/accordian/appoinment-cancel-comment-model';
import { PracticeService } from '@appDir/front-desk/masters/practice/practice/services/practice.service';
import { UsersUrlsEnum } from '../../users-urls.enum';

@Component({
  selector: 'app-delete-appointments',
  templateUrl: './delete-appointments.component.html',
  styleUrls: ['./delete-appointments.component.scss'],
})
export class DeleteAppointmentsComponent implements OnInit, OnDestroy {
  subscription: Subscription[] = [];
  myForm: FormGroup;
  public provider: any;
  public data: any;
  public dataToShow: any = [];
  public dataOnClearSpecialty: any = [];
  chartIdSetterArray: any[];
  public counter: any = 10;
  public lastPage: any;
  public allChecked = false;
  public pageNumber = 1;
  public entriesOnLastPage: any;
  public counterChecked = 0;
  public isEnableButtons: any = true;
  public numSelected: any;
  public specialityData = [];
  public uniqueSpecialities = [];
  isDisabledFormControls: boolean = false;
  public disableDeleteBtn: boolean = false;
  defaultComments: AppointmentCancelCommentModel[]=[];
  comments: any;
  paramsStored:any={};
  isOtherChecked = false;
  selectedAppointments: any[];
  appointmentsToDelete = [];
  loadSpin: boolean = false;
  lstFacilities: Array<any> = [];
  facilitiesDropdownData: Array<any> = [];
  lstSpecialties: any[] = [];
  Facility_list_dropdown_GET = FacilityUrlsEnum.Facility_list_dropdown_GET;
  @Input() appointments: any[];
  @Input() assignments: any[];
  @Input() assignments_exist: boolean;
  @Input() modalRef: any;
  @Input() userId: number;
  @Input() userName: string;
  @Output() appointmentsDeleted: EventEmitter<boolean> = new EventEmitter<boolean>();
  appointments_slugs=["schedule_change","patient_cancelled","other","insurance_issues","as_per_atty","transport", "practice_off","provider_cancelled","user_practice_locations_off"];

  constructor(
    public activeModal: NgbActiveModal,
    public datePipeService: DatePipeFormatService,
    public requestService: RequestService,
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private practiceService: PracticeService,
  ) {}

  ngOnInit(): void {
    this.intializeForm();
    this.loadSpin = false;
    this.appointments = Object.values(this.appointments);
    this.chartIdSetterArray = this.appointments;
    this.setChartId();
    this.data = this.chartIdSetterArray;
    this.dataOnClearSpecialty = this.data
    this.getProvider();
  }

  ngOnDestroy() {
    unSubAllPrevious(this.subscription);
  }

  intializeForm() {
    this.myForm = this.fb.group({
      provider: { value: '', disabled: true },
      facility_location_id: [{ value: null}],
      specialty_id: [{ value: null, disabled: true }],
      defaultComments: ['',[Validators.required]],
      otherComments: '', 
    });
    this.getAppointmensComments();
  }

  setChartId() {
    for (let i = 0; i < this.chartIdSetterArray.length; i++) {
      var startString = '000-00-';
      var receivedString = JSON.stringify(
        this.chartIdSetterArray[i]?.patient_id
      );
      var finalStr = startString + receivedString.padStart(4, '0');
      this.chartIdSetterArray[i].patient_id = finalStr;
    }
  }

  getProvider() {
    const providerName = this.userName;
    this.myForm.patchValue({
      provider: providerName,
    });
  }

  get facilityLocationControl() {
    return this.myForm.get('facility_location_id');
  }

  get specialityControl() {
    return this.myForm.get('specialty_id');
  }

  cancelForm() {
    this.activeModal.close();
  }


  onchangeFacilityLocation(event) {
    this.specialityControl.disable();
    this.resetspecialty();
    if (event) {
      this.specialityControl.enable();
    }
  }

  resetspecialty() {
    this.lstSpecialties = [];
    this.specialityControl.reset();
  }

  public changeNoOfEntries(e) {
    this.counter = parseInt(e);
    this.lastPage = Math.ceil(this.data.length / this.counter);
    if (this.pageNumber > this.lastPage) {
      this.pageNumber = this.lastPage;
    }
    this.loadData(); // Reload data based on new entries per page
  }

  public changePage(e) {
    this.loadSpin=true;
    this.pageNumber = e.offset + 1;
    this.loadData(); // Reload data for the selected page
  }

  public loadData() {
    let start = (this.pageNumber - 1) * this.counter;
    let end = Math.min(start + this.counter, this.data.length);
    this.dataToShow = this.data.slice(start, end);
    this.loadSpin=false;
  }

  public allSelected(e) {
    this.counterChecked = 0;
    if (e.checked) {
      this.allChecked = true;
      let start = this.counter * (this.pageNumber - 1);
      for (var i = start; i < start + this.counter; i++) {
        if (this.data[i] != undefined) {
            if (!this.data[i]?.evaluation_date_time) 
            {
              this.data[i]['isChecked'] = true;
              this.appointmentsToDelete.push(this.data[i]?.id);
              this.counterChecked++;
            }
        }
      }
    } else {
      this.allChecked = false;
      let start = this.counter * (this.pageNumber - 1);
      for (var i = start; i < start + this.counter; i++) {
        if (this.data[i] != undefined) {
          if (this.data[i]['isChecked'] == true) {
            this.data[i]['isChecked'] = false;
            this.appointmentsToDelete.splice(
              this.appointmentsToDelete.indexOf(this.data[i]?.id),
              1
            );
            this.counterChecked--;
          }
        }
      }
    }
  }

  ngSelectClear(Type) {
		this.myForm.controls[Type].setValue(null);
    this.data = this.dataOnClearSpecialty;
	}

  getAppointmensComments(){
    this.defaultComments=[];
    this.isOtherChecked = false;
    this.subscription.push(
      this.practiceService.getAppointmensComments()
        .subscribe(
          (res) => {
            if(res?.status){
              this.loadSpin=false;
              const appointments = this.appointmentsCommentsSelection(res?.result?.data);
              this.myForm.get('defaultComments').setValue(appointments?.selectAppointmentName || '');
              this.defaultComments = appointments?.selectedAppointment || [];           
          }
          },
          (err) => { this.loadSpin=false },
        ),
    );
  
  }

  appointmentsCommentsSelection(arr) {
    const selectedAppointment = arr?.filter(appointment => this.appointments_slugs.includes(appointment?.slug));
    // Find the index of the object with slug 'other'
    const otherIndex = selectedAppointment.findIndex(appointment => appointment?.slug === 'other');

   // If the object with slug 'other' is found, remove it from its current position and add it to the end of the array
    if (otherIndex !== -1) {
      const otherAppointment = selectedAppointment.splice(otherIndex, 1)[0];
      selectedAppointment.push(otherAppointment);
    }
    const selectAppointmentName = selectedAppointment.find(appointment => appointment?.slug === 'user_practice_locations_off')?.name || '';
  
    return { selectedAppointment, selectAppointmentName };
  }

  onSelectValue() {
    let value=this.myForm.get('defaultComments').value
    if (value && value=='Other') {
        this.isOtherChecked = true;
      }
      else
      {
        this.isOtherChecked = false;
      }
  }

  onCancelAppointmentAndAssigments(){
    this.loadSpin = true;
    this.appointmentsToDelete = this.appointments.map(appointments => appointments?.id);
    let data = {
      appointment_ids: this.appointmentsToDelete,
      cancelled_comments: this.myForm.get('defaultComments')?.value
    };
    this.subscription.push(
      this.requestService
        .sendRequest(
          AssignSpecialityUrlsEnum.Cancel_Appointment_new,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl1,
          data
        )
        .subscribe((res: any) => {
          if (res?.status === true && res?.result && !res?.result?.data) {
            let assignmentIds: any [] = this.assignments.map(assignment => assignment?.id);
            let cmDataString = localStorage.getItem('cm_data');
            const cmData = JSON.parse(cmDataString);
            const userId = cmData?.user_id;
            let body ={
              user_id: userId,
              available_doctor_ids: assignmentIds,
            }
            // delete assignment Api
            this.requestService.sendRequest(UsersUrlsEnum.delete_multiple_assignments, 'POST',REQUEST_SERVERS.schedulerApiUrl1,body)
            .subscribe((res:any) => {
              this.loadSpin = false;
              this.toastrService.success('Assignments and Appointments have been deleted successfully.', 'Success');
              this.appointmentsDeleted.emit(true);
            },
            (err) => {
              this.loadSpin = false;
            })
            this.activeModal.close();
          } else if (res?.status == 200 && res?.result && res?.result?.data) {
            const ngbModalOptions: NgbModalOptions = {
              backdrop: 'static',
              keyboard: false,
              size: 'lg',
            };

            if (
              res.result?.data?.length <
              (data?.appointment_ids && data?.appointment_ids?.length)
            ) {
              this.toastrService.success(
                'Appointments Deleted Successfully',
                'Success'
              );
            }
          }
        },(err) => {
          this.loadSpin = false;
        })

    );
  }

  timeConversion(time) {
		return convertDateTimeForRetrieving(null, new Date(time));
	} 
}
