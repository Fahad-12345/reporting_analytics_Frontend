// import { Injectable } from '@angular/core';
// import { ProfileImage } from '../components/user-form/profile-image';
// import { BehaviorSubject } from 'rxjs';
// import { ActivatedRoute } from '@angular/router';

// @Injectable({
// 	providedIn: 'root'
// })
// export class UserProfileImageService {
// 	user = JSON.parse(localStorage.getItem('cm_user'));
// 	urlID = localStorage.getItem('urlID');
// 	public user_id = this.user['userData'].id;

// 	public user_firstName = this.user['userData']['basicInfo']['first_name'];
// 	public user_lastName = this.user['userData']['basicInfo']['last_name'];
// 	public user_name = this.user_firstName + ' ' + this.user_lastName;
// 	public defaultImage: ProfileImage = { profileImage: this.user['userData']['basicInfo']['profile_pic_url'] };
// 	constructor(private activatedRoute: ActivatedRoute) {

// 	}

// 	private image = new BehaviorSubject(this.defaultImage);
// 	public currentImage = this.image.asObservable();


// 	setProfileImage(url: string) {
// 		if (this.user_id === this.urlID) {
// 			this.defaultImage.profileImage = url;
// 			// console.log('url', url, this.defaultImage.profileImage);
// 			this.image.next(this.defaultImage);
// 		}
// 		console.log('urlID', this.urlID);
// 		console.log('user_id', this.user_id);
// 		console.log('user_name', this.user_name);
// 	}

// }
