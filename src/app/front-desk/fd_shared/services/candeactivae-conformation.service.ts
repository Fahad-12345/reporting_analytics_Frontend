import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CandeactivaeConformationService {
  private subject = new Subject<any>();
  constructor() { }
  sendFormDetails(form: FormGroup) {
    this.subject.next({ form: form });
  }
  cleanForm() {

  }
  getFormDetails(): Observable<any> {
    return this.subject.asObservable();
  }
}
