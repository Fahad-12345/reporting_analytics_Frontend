import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
	selector: 'app-assign-speciality',
	templateUrl: './assign-speciality.component.html',
	styleUrls: ['./assign-speciality.component.scss'],
})
export class AssignSpecialityComponent {
	public content: string;
	constructor(private titleService: Title) {
		this.content = 'hello world';
		this.titleService.setTitle('Specialty');
	}
}
