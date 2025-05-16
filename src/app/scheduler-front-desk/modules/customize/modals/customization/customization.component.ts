import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
//services
import { FrontDeskService } from '../../../../front-desk.service'
import { SubjectService } from '../../../../subject.service';
import { ToastrService } from 'ngx-toastr';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { AclService } from '@appDir/shared/services/acl.service';
import { Router } from '@angular/router';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { CustomizationUrlsEnum } from '../../customization-urls-enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
@Component({
  selector: 'app-create-appointment',
  templateUrl: './customization.component.html',
  styleUrls: ['./customization.component.scss']
})
export class CustomizationComponent extends PermissionComponent implements OnInit {
  public title: any
  public patientfirst: any;
  public patientlast: any;
  public chart: any;
  public timeSlotLimit = 0
  public clinics: any = [];
  public speciality: any = [];
  public isClinic: boolean = false;
  public editSpecialityColor: boolean = true;
  public editSpecialityTimeSlot: boolean = true;
  public editSpecialityOverBooking: boolean = true;
  public facilityColorEdit: boolean = true;
  public clinicId: any;
  public specColorStatusCode: any;
  public specTimeSlotStatusCode: any;
  constructor(
    aclService: AclService,
    router: Router,
    protected requestService: RequestService,
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private storageData: StorageData,
    public subjectService: SubjectService,
    public cdr: ChangeDetectorRef, public toasterService: ToastrService,
    private frontDeskService: FrontDeskService,
    private customDiallogService: CustomDiallogService,
    ) {
    super(aclService, router);

  }
  ngOnInit() {
    if (this.aclService.hasPermission(this.userPermissions.customize_speciality_color_edit)
      || this.storageData.isSuperAdmin()) {
      this.editSpecialityColor = false;
    }
    if (this.aclService.hasPermission(this.userPermissions.customize_speciality_timeslot_edit)
      || this.storageData.isSuperAdmin()) {
      this.editSpecialityTimeSlot = false;
    }
    if (this.aclService.hasPermission(this.userPermissions.customize_speciality_overbooking_edit)
      || this.storageData.isSuperAdmin()) {
      this.editSpecialityOverBooking = false;
    }
    if (this.aclService.hasPermission(this.userPermissions.customize_facility_color_edit)
      || this.storageData.isSuperAdmin()) {
      this.facilityColorEdit = false;
    }
    this.clinicId = this.frontDeskService.customizeData.id;
    this.title = this.frontDeskService.customizeData.name;
    this.patientfirst = this.frontDeskService.customizeData.timeSlot;
    this.patientlast = this.frontDeskService.customizeData.overBooking;
    this.chart = this.frontDeskService.customizeData.color;
    this.isClinic = this.frontDeskService.isClinic;
  }
  /*Change/Update color of clinic*/
  public changeClinicColor(event) {
    this.chart = event.target.value;
  }
  /*Change/Update color of speciality*/
  public changeSpecColor(event) {
    this.chart = event.target.value;
  }
  /*Change/Update time slot of speciality*/
  public changeSpecTimeSlot(event) {
    this.patientfirst = event.target.value;
  }
  /*Change/Update overbooking of speciality*/
  public changeSpecOverBooking(event) {
    this.patientlast = event.target.value;
  }
  /*Form submition of speciality*/
  public submitSpec() {
    if (this.chart != this.frontDeskService.customizeData.color) {
      let color = this.chart;
    //   color = color.slice(1, 7);
      var object = {
        "specialities": [{ 'specID': this.clinicId, 'color': color }]
      }
      this.requestService
        .sendRequest(
          CustomizationUrlsEnum.changeSpecialityColor,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl,
          object
        ).subscribe(
          (res: HttpSuccessResponse) => {
            this.toasterService.success('Color updated successfully', 'Success')
            this.specColorStatusCode = 200;
            this.subjectService.refreshClinicCustomization('refreshCustomization')
            this.activeModal.close()
          }, error => {
            this.specColorStatusCode = 200;
            this.subjectService.refreshClinicCustomization('refreshCustomization')
          })
    }
    var reqObj = {
      'specId': this.clinicId
    }
    this.requestService
      .sendRequest(
        CustomizationUrlsEnum.preCheckForChangingTimeslot,
        'POST',
        REQUEST_SERVERS.schedulerApiUrl,
        reqObj
      ).subscribe(
        (res: HttpSuccessResponse) => {
          if (res.result.data.length != 0) {
            this.timeSlotLimit = res.result.data[0].value
            if ((parseInt(this.patientfirst) <= this.timeSlotLimit || this.timeSlotLimit == 0)) {
              if (parseInt(this.patientfirst) != this.frontDeskService.customizeData.timeSlot) {
                if (parseInt(this.patientfirst) % 5 == 0 && (parseInt(this.patientfirst)) != 0) {
                 
                  this.customDiallogService.confirm('Update','Are you sure?','Yes','No')
                  .then((confirmed) => {
                    if (confirmed){
                      var object = { "speciality": [{ "specId": this.clinicId, "timeSlot": parseInt(this.patientfirst) }] }
                      this.requestService
                        .sendRequest(
                          CustomizationUrlsEnum.changeSpecialityTimeSlot,
                          'POST',
                          REQUEST_SERVERS.schedulerApiUrl,
                          object
                        ).subscribe(
                          (res: HttpSuccessResponse) => {
                            this.toasterService.success('Timeslot updated successfully', 'Success')
                            this.specTimeSlotStatusCode = 200;
                            this.subjectService.refreshClinicCustomization('refreshCustomization')
                          }, error => {
                            this.specColorStatusCode = 200;
                            this.subjectService.refreshClinicCustomization('refreshCustomization')
                          }
                        );
                    }else if(confirmed === false){
                    }else{
                    }
                  })
                  .catch();
                }
                else {
                  this.toasterService.error("Timeslot must be absolute and multiple of 5", 'Error')
                  return
                }
              }
            }
            else {
              this.toasterService.error("Timeslot must be smaller than " + this.timeSlotLimit, 'Error')
              return
            }
          }

        }, error => {
          this.specColorStatusCode = 200;
          this.subjectService.refreshClinicCustomization('refreshCustomization')
        }
      );


    if (parseInt(this.patientlast) >= 0) {
      if (parseInt(this.patientlast) != this.frontDeskService.customizeData.overBooking) {
        var obj = {
          "speciality": [
            {
              "id": this.clinicId,
              "overBooking": this.patientlast
            }
          ]
        }
        this.requestService
          .sendRequest(
            CustomizationUrlsEnum.updateOverBookingLimit,
            'POST',
            REQUEST_SERVERS.schedulerApiUrl,
            obj
          ).subscribe(
            (res: HttpSuccessResponse) => {
              this.toasterService.success('OverBooking updated successfully', 'Success')
              this.specTimeSlotStatusCode = 200;
              this.subjectService.refreshClinicCustomization('refreshCustomization')
            }, error => {
              this.specColorStatusCode = 200;
              this.subjectService.refreshClinicCustomization('refreshCustomization')
            }
          );
      }
    } else {
      this.toasterService.error("overBooking should be greater than equal to 0")
      return;
    }
    this.subjectService.refreshClinicCustomization('refreshCustomization')

  }
  /*Form submition of clinic*/
  public submitClinic() {
    if (this.chart != this.frontDeskService.customizeData.color) {
      let color = this.chart;
      color = color.slice(1, 7);
      var object = {
        "clinics": [{ "color": color, "clinicID": this.clinicId }]
      }
      this.requestService
        .sendRequest(
          CustomizationUrlsEnum.changeFacilityColor,
          'POST',
          REQUEST_SERVERS.schedulerApiUrl,
          object
        ).subscribe(
          res => {
            this.subjectService.refreshClinicCustomization('refreshCustomization')
            this.toasterService.success('Color updated successfully', 'Success')
            this.activeModal.close();
          }, error => {
          })

    }
  }
}
