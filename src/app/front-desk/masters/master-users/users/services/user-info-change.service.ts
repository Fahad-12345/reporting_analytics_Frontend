import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { UserProfile } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserInfoChangeService {

    constructor() { }
    private userInfoChangeSubject: BehaviorSubject<UserProfile> = new BehaviorSubject<UserProfile>({} as UserProfile)
    private fetchUserInfoSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    private savePrivilegesData = new Subject()
	isClickedOnUserPic : BehaviorSubject<object> = new BehaviorSubject<object>({action:false,id:-1});
    private isFormDirty = new Subject();
    private isPracticeChanged:BehaviorSubject<boolean>=new BehaviorSubject<boolean>(false);
    public $practiceStatus=this.isPracticeChanged.asObservable();

    onSavePrivilegesData(bool:boolean){
        this.savePrivilegesData.next(bool);
    }
    onSavePrivilegesDataListener(){
        return this.savePrivilegesData.asObservable();
    }

    /**
     * Call function on fetch user info
     * @param {boolean} bool 
     */
    onFetchUserInfoSubject(bool: boolean) {
        this.fetchUserInfoSubject.next(bool)
    }

    /**
     * @returns {Subject} fetchUserInfoSubject  
     */
    onFetchUserInfoListener() {
        return this.fetchUserInfoSubject
    }

    /**
     * Call function on user info change;
     * @param {UserProfile} user 
     */
    onUserInfoChange(user: UserProfile) {
        this.userInfoChangeSubject.next(user)
    }

    /**
     * listen to user info change 
     * @return {Subject<UserProfile>} userInfoChangeSubject
     */
    userInfoChangeListener() {
        return this.userInfoChangeSubject
    }

    sendMessage(message: string) {
        this.isFormDirty.next({ text: message });
    }
 
    clearMessages() {
        this.isFormDirty.next(1);
    }
 
    getMessage() {
        return this.isFormDirty.asObservable();
    }
    getPracticeStatus(status){
        this.isPracticeChanged.next(status)
    }
}
