import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanDeactivateComponentInterface } from '@appDir/shared/canDeactivateFormsComponent/CanDeactivateComponent.interface';
import { PracticeFormComponent } from '../shared/practice-form/practice-form.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-practice-edit',
  templateUrl: './practice-edit.component.html',
  styleUrls: ['./practice-edit.component.scss']
})
export class PracticeEditComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }
  practiceId: number;
  practiceForm: FormGroup;
  ngOnInit() {
    this.practiceId = parseInt(this.route.snapshot.params.id);
  }
  // @ViewChild('edit') PracticeFormComponent: PracticeFormComponent
  // ngAfterViewInit() {
  //   this.practiceForm = PracticeFormComponent['practiceForm'];
  // }
  // canDeactivate = () => {
  //   ;
  //   return (this.practiceForm.dirty && this.practiceForm.touched);
  // }
}
