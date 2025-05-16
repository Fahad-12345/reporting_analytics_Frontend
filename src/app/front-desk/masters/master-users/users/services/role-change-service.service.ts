import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleChangeServiceService {

  constructor() { }
  private roleChangeSubject: Subject<boolean> = new Subject<boolean>()

  /**
   * Call function on role change;
   * @param {boolean} bool 
   */
  onRoleChange(bool: boolean) {
    this.roleChangeSubject.next(bool)
  }

  /**
   * listen to role change 
   * @return {Subject<boolean>} roleChangeSubject
   */
  roleChangeListener() {
    return this.roleChangeSubject
  }
}
