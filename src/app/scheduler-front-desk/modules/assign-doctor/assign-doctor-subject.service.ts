import { BehaviorSubject } from 'rxjs';

export class AssignDoctorSubjectService{
    public monthAssignment=new BehaviorSubject<any>([]);
    public castMonthAssignment=this.monthAssignment.asObservable();
    public getMonthAssignment(assign){
        this.monthAssignment.next(assign)
    }
  public update=new BehaviorSubject<any>([]);
  public castupdateAssignment=this.update.asObservable();
  public refreshUpdate(assign){
    this.update.next(assign)
  }
}
