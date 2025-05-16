import { Logger } from '@nsalaun/ng-logger';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DynamicFormModule } from '@appDir/shared/dynamic-form/dynamic-form.module';
import { of } from 'rxjs';
import { ToastrModule } from 'ngx-toastr';
import { CreateCaseFormComponent } from './create-case-form.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("CreateCaseFormComponent"), () => {
	let comp: CreateCaseFormComponent;
	let fixture: ComponentFixture<CreateCaseFormComponent>;
	let caseMaster_Mock = {
		"message": "success",
		"status": 200,
		"result": {
		  "data": {
			"relations": [
			  {
				"id": 1,
				"key": null,
				"name": "Father",
				"slug": "father",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 2,
				"key": null,
				"name": "Mother",
				"slug": "mother",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 3,
				"key": null,
				"name": "Brother",
				"slug": "brother",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 4,
				"key": null,
				"name": "Sister",
				"slug": "sister",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 5,
				"key": null,
				"name": "Son",
				"slug": "son",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 6,
				"key": null,
				"name": "Daughter",
				"slug": "daughter",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 7,
				"key": null,
				"name": "Spouse",
				"slug": "spouse",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 8,
				"key": null,
				"name": "Other",
				"slug": "other",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  }
			],
			"body_parts": [
			  {
				"id": 1,
				"name": "Head",
				"slug": "head",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 12,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Tingling",
					"slug": "tingling",
					"id": 1,
					"sensation_id": 6,
					"body_part_id": 1,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 2,
					"sensation_id": 9,
					"body_part_id": 1,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Prickling",
					"slug": "prickling",
					"id": 3,
					"sensation_id": 11,
					"body_part_id": 1,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Pins and Needles",
					"slug": "pins_and_needles",
					"id": 4,
					"sensation_id": 12,
					"body_part_id": 1,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 2,
				"name": "Neck",
				"slug": "neck",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 13,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 5,
					"sensation_id": 1,
					"body_part_id": 2,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 6,
					"sensation_id": 2,
					"body_part_id": 2,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 7,
					"sensation_id": 3,
					"body_part_id": 2,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 8,
					"sensation_id": 4,
					"body_part_id": 2,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 9,
					"sensation_id": 5,
					"body_part_id": 2,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 10,
					"sensation_id": 8,
					"body_part_id": 2,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 11,
					"sensation_id": 9,
					"body_part_id": 2,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 12,
					"sensation_id": 10,
					"body_part_id": 2,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 3,
				"name": "Right Shoulder",
				"slug": "right_shoulder",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 90,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 13,
					"sensation_id": 1,
					"body_part_id": 3,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 14,
					"sensation_id": 2,
					"body_part_id": 3,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 15,
					"sensation_id": 3,
					"body_part_id": 3,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 16,
					"sensation_id": 4,
					"body_part_id": 3,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 17,
					"sensation_id": 5,
					"body_part_id": 3,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 18,
					"sensation_id": 8,
					"body_part_id": 3,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 19,
					"sensation_id": 9,
					"body_part_id": 3,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 20,
					"sensation_id": 10,
					"body_part_id": 3,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 4,
				"name": "Left Shoulder",
				"slug": "left_shoulder",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 91,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 21,
					"sensation_id": 1,
					"body_part_id": 4,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 22,
					"sensation_id": 2,
					"body_part_id": 4,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 23,
					"sensation_id": 3,
					"body_part_id": 4,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 24,
					"sensation_id": 4,
					"body_part_id": 4,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 25,
					"sensation_id": 5,
					"body_part_id": 4,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 26,
					"sensation_id": 8,
					"body_part_id": 4,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 27,
					"sensation_id": 9,
					"body_part_id": 4,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 28,
					"sensation_id": 10,
					"body_part_id": 4,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 5,
				"name": "Right arm",
				"slug": "right_arm",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 53,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 29,
					"sensation_id": 1,
					"body_part_id": 5,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 30,
					"sensation_id": 2,
					"body_part_id": 5,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 31,
					"sensation_id": 3,
					"body_part_id": 5,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 32,
					"sensation_id": 4,
					"body_part_id": 5,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 33,
					"sensation_id": 5,
					"body_part_id": 5,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 34,
					"sensation_id": 8,
					"body_part_id": 5,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 35,
					"sensation_id": 9,
					"body_part_id": 5,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 36,
					"sensation_id": 10,
					"body_part_id": 5,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 6,
				"name": "Left arm",
				"slug": "left_arm",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 54,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 37,
					"sensation_id": 1,
					"body_part_id": 6,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 38,
					"sensation_id": 2,
					"body_part_id": 6,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 39,
					"sensation_id": 3,
					"body_part_id": 6,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 40,
					"sensation_id": 4,
					"body_part_id": 6,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 41,
					"sensation_id": 5,
					"body_part_id": 6,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 42,
					"sensation_id": 8,
					"body_part_id": 6,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 43,
					"sensation_id": 9,
					"body_part_id": 6,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 44,
					"sensation_id": 10,
					"body_part_id": 6,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 7,
				"name": "Right forearm",
				"slug": "right_forearm",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 57,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 45,
					"sensation_id": 1,
					"body_part_id": 7,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 46,
					"sensation_id": 2,
					"body_part_id": 7,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 47,
					"sensation_id": 3,
					"body_part_id": 7,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 48,
					"sensation_id": 4,
					"body_part_id": 7,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 49,
					"sensation_id": 5,
					"body_part_id": 7,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 50,
					"sensation_id": 8,
					"body_part_id": 7,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 51,
					"sensation_id": 9,
					"body_part_id": 7,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 52,
					"sensation_id": 10,
					"body_part_id": 7,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 8,
				"name": "Left forearm",
				"slug": "left_forearm",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 58,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 53,
					"sensation_id": 1,
					"body_part_id": 8,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 54,
					"sensation_id": 2,
					"body_part_id": 8,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 55,
					"sensation_id": 3,
					"body_part_id": 8,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 56,
					"sensation_id": 4,
					"body_part_id": 8,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 57,
					"sensation_id": 5,
					"body_part_id": 8,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 58,
					"sensation_id": 8,
					"body_part_id": 8,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 59,
					"sensation_id": 9,
					"body_part_id": 8,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 60,
					"sensation_id": 10,
					"body_part_id": 8,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 9,
				"name": "Right elbow",
				"slug": "right_elbow",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 55,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 61,
					"sensation_id": 1,
					"body_part_id": 9,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 62,
					"sensation_id": 2,
					"body_part_id": 9,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 63,
					"sensation_id": 3,
					"body_part_id": 9,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 64,
					"sensation_id": 4,
					"body_part_id": 9,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 65,
					"sensation_id": 5,
					"body_part_id": 9,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 66,
					"sensation_id": 8,
					"body_part_id": 9,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 67,
					"sensation_id": 9,
					"body_part_id": 9,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 68,
					"sensation_id": 10,
					"body_part_id": 9,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 10,
				"name": "Left elbow",
				"slug": "left_elbow",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 56,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 69,
					"sensation_id": 1,
					"body_part_id": 10,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 70,
					"sensation_id": 2,
					"body_part_id": 10,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 71,
					"sensation_id": 3,
					"body_part_id": 10,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 72,
					"sensation_id": 4,
					"body_part_id": 10,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 73,
					"sensation_id": 5,
					"body_part_id": 10,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 74,
					"sensation_id": 8,
					"body_part_id": 10,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 75,
					"sensation_id": 9,
					"body_part_id": 10,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 76,
					"sensation_id": 10,
					"body_part_id": 10,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 11,
				"name": "Right wrist",
				"slug": "right_wrist",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 59,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 77,
					"sensation_id": 1,
					"body_part_id": 11,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 78,
					"sensation_id": 2,
					"body_part_id": 11,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 79,
					"sensation_id": 3,
					"body_part_id": 11,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 80,
					"sensation_id": 4,
					"body_part_id": 11,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 81,
					"sensation_id": 5,
					"body_part_id": 11,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 82,
					"sensation_id": 8,
					"body_part_id": 11,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 83,
					"sensation_id": 9,
					"body_part_id": 11,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 84,
					"sensation_id": 10,
					"body_part_id": 11,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 12,
				"name": "Left wrist",
				"slug": "left_wrist",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 60,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 85,
					"sensation_id": 1,
					"body_part_id": 12,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 86,
					"sensation_id": 2,
					"body_part_id": 12,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 87,
					"sensation_id": 3,
					"body_part_id": 12,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 88,
					"sensation_id": 4,
					"body_part_id": 12,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 89,
					"sensation_id": 5,
					"body_part_id": 12,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 90,
					"sensation_id": 8,
					"body_part_id": 12,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 91,
					"sensation_id": 9,
					"body_part_id": 12,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 92,
					"sensation_id": 10,
					"body_part_id": 12,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 13,
				"name": "Right hand",
				"slug": "right_hand",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 61,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 93,
					"sensation_id": 1,
					"body_part_id": 13,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 94,
					"sensation_id": 2,
					"body_part_id": 13,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 95,
					"sensation_id": 3,
					"body_part_id": 13,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 96,
					"sensation_id": 4,
					"body_part_id": 13,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 97,
					"sensation_id": 5,
					"body_part_id": 13,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 98,
					"sensation_id": 8,
					"body_part_id": 13,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 99,
					"sensation_id": 9,
					"body_part_id": 13,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 100,
					"sensation_id": 10,
					"body_part_id": 13,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 14,
				"name": "Left hand",
				"slug": "left_hand",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 62,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 101,
					"sensation_id": 1,
					"body_part_id": 14,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 102,
					"sensation_id": 2,
					"body_part_id": 14,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 103,
					"sensation_id": 3,
					"body_part_id": 14,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 104,
					"sensation_id": 4,
					"body_part_id": 14,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 105,
					"sensation_id": 5,
					"body_part_id": 14,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 106,
					"sensation_id": 8,
					"body_part_id": 14,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 107,
					"sensation_id": 9,
					"body_part_id": 14,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 108,
					"sensation_id": 10,
					"body_part_id": 14,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 15,
				"name": "Upper Back",
				"slug": "upper_back",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 22,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 109,
					"sensation_id": 1,
					"body_part_id": 15,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 110,
					"sensation_id": 2,
					"body_part_id": 15,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 111,
					"sensation_id": 3,
					"body_part_id": 15,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 112,
					"sensation_id": 4,
					"body_part_id": 15,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 113,
					"sensation_id": 5,
					"body_part_id": 15,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 114,
					"sensation_id": 8,
					"body_part_id": 15,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 115,
					"sensation_id": 9,
					"body_part_id": 15,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 116,
					"sensation_id": 10,
					"body_part_id": 15,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 16,
				"name": "Mid Back",
				"slug": "mid_back",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 23,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 117,
					"sensation_id": 1,
					"body_part_id": 16,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 118,
					"sensation_id": 2,
					"body_part_id": 16,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 119,
					"sensation_id": 3,
					"body_part_id": 16,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 120,
					"sensation_id": 4,
					"body_part_id": 16,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 121,
					"sensation_id": 5,
					"body_part_id": 16,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 122,
					"sensation_id": 8,
					"body_part_id": 16,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 123,
					"sensation_id": 9,
					"body_part_id": 16,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 124,
					"sensation_id": 10,
					"body_part_id": 16,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 17,
				"name": "Lower Back",
				"slug": "lower_back",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 24,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 125,
					"sensation_id": 1,
					"body_part_id": 17,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 126,
					"sensation_id": 2,
					"body_part_id": 17,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 127,
					"sensation_id": 3,
					"body_part_id": 17,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 128,
					"sensation_id": 4,
					"body_part_id": 17,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 129,
					"sensation_id": 5,
					"body_part_id": 17,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 130,
					"sensation_id": 8,
					"body_part_id": 17,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 131,
					"sensation_id": 9,
					"body_part_id": 17,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 132,
					"sensation_id": 10,
					"body_part_id": 17,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 18,
				"name": "Right Hip",
				"slug": "right_hip",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 92,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 133,
					"sensation_id": 1,
					"body_part_id": 18,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 134,
					"sensation_id": 2,
					"body_part_id": 18,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 135,
					"sensation_id": 3,
					"body_part_id": 18,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 136,
					"sensation_id": 4,
					"body_part_id": 18,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 137,
					"sensation_id": 5,
					"body_part_id": 18,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 138,
					"sensation_id": 8,
					"body_part_id": 18,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 139,
					"sensation_id": 9,
					"body_part_id": 18,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 140,
					"sensation_id": 10,
					"body_part_id": 18,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 19,
				"name": "Left Hip",
				"slug": "left_hip",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 93,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 141,
					"sensation_id": 1,
					"body_part_id": 19,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 142,
					"sensation_id": 2,
					"body_part_id": 19,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 143,
					"sensation_id": 3,
					"body_part_id": 19,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 144,
					"sensation_id": 4,
					"body_part_id": 19,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 145,
					"sensation_id": 5,
					"body_part_id": 19,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 146,
					"sensation_id": 8,
					"body_part_id": 19,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 147,
					"sensation_id": 9,
					"body_part_id": 19,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 148,
					"sensation_id": 10,
					"body_part_id": 19,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 20,
				"name": "Right leg",
				"slug": "right_leg",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 63,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 149,
					"sensation_id": 1,
					"body_part_id": 20,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 150,
					"sensation_id": 2,
					"body_part_id": 20,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 151,
					"sensation_id": 3,
					"body_part_id": 20,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 152,
					"sensation_id": 4,
					"body_part_id": 20,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 153,
					"sensation_id": 5,
					"body_part_id": 20,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 154,
					"sensation_id": 8,
					"body_part_id": 20,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 155,
					"sensation_id": 9,
					"body_part_id": 20,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 156,
					"sensation_id": 10,
					"body_part_id": 20,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 21,
				"name": "Left leg",
				"slug": "left_leg",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 64,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 157,
					"sensation_id": 1,
					"body_part_id": 21,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 158,
					"sensation_id": 2,
					"body_part_id": 21,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 159,
					"sensation_id": 3,
					"body_part_id": 21,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 160,
					"sensation_id": 4,
					"body_part_id": 21,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 161,
					"sensation_id": 5,
					"body_part_id": 21,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 162,
					"sensation_id": 8,
					"body_part_id": 21,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 163,
					"sensation_id": 9,
					"body_part_id": 21,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 164,
					"sensation_id": 10,
					"body_part_id": 21,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 22,
				"name": "Right Knee",
				"slug": "right_knee",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 94,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 165,
					"sensation_id": 1,
					"body_part_id": 22,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 166,
					"sensation_id": 2,
					"body_part_id": 22,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 167,
					"sensation_id": 3,
					"body_part_id": 22,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 168,
					"sensation_id": 4,
					"body_part_id": 22,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 169,
					"sensation_id": 5,
					"body_part_id": 22,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 170,
					"sensation_id": 8,
					"body_part_id": 22,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 171,
					"sensation_id": 9,
					"body_part_id": 22,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 172,
					"sensation_id": 10,
					"body_part_id": 22,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 23,
				"name": "Left Knee",
				"slug": "left_knee",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 95,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 173,
					"sensation_id": 1,
					"body_part_id": 23,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 174,
					"sensation_id": 2,
					"body_part_id": 23,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 175,
					"sensation_id": 3,
					"body_part_id": 23,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 176,
					"sensation_id": 4,
					"body_part_id": 23,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 177,
					"sensation_id": 5,
					"body_part_id": 23,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 178,
					"sensation_id": 8,
					"body_part_id": 23,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 179,
					"sensation_id": 9,
					"body_part_id": 23,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 180,
					"sensation_id": 10,
					"body_part_id": 23,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 24,
				"name": "Right ankle",
				"slug": "right_ankle",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 65,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 181,
					"sensation_id": 1,
					"body_part_id": 24,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 182,
					"sensation_id": 2,
					"body_part_id": 24,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 183,
					"sensation_id": 3,
					"body_part_id": 24,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 184,
					"sensation_id": 4,
					"body_part_id": 24,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 185,
					"sensation_id": 5,
					"body_part_id": 24,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 186,
					"sensation_id": 8,
					"body_part_id": 24,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 187,
					"sensation_id": 9,
					"body_part_id": 24,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 188,
					"sensation_id": 10,
					"body_part_id": 24,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 25,
				"name": "Left ankle",
				"slug": "left_ankle",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 66,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 189,
					"sensation_id": 1,
					"body_part_id": 25,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 190,
					"sensation_id": 2,
					"body_part_id": 25,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 191,
					"sensation_id": 3,
					"body_part_id": 25,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 192,
					"sensation_id": 4,
					"body_part_id": 25,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 193,
					"sensation_id": 5,
					"body_part_id": 25,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 194,
					"sensation_id": 8,
					"body_part_id": 25,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 195,
					"sensation_id": 9,
					"body_part_id": 25,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 196,
					"sensation_id": 10,
					"body_part_id": 25,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 26,
				"name": "Right foot",
				"slug": "right_foot",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 67,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 197,
					"sensation_id": 1,
					"body_part_id": 26,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 198,
					"sensation_id": 2,
					"body_part_id": 26,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 199,
					"sensation_id": 3,
					"body_part_id": 26,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 200,
					"sensation_id": 4,
					"body_part_id": 26,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 201,
					"sensation_id": 5,
					"body_part_id": 26,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 202,
					"sensation_id": 8,
					"body_part_id": 26,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 203,
					"sensation_id": 9,
					"body_part_id": 26,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 204,
					"sensation_id": 10,
					"body_part_id": 26,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 27,
				"name": "Left foot",
				"slug": "left_foot",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null,
				"body_part_id": 68,
				"position": null,
				"pain_level": 10,
				"body_part_sensations": [
				  {
					"name": "Intermittent Sharp",
					"slug": "intermittent_sharp",
					"id": 205,
					"sensation_id": 1,
					"body_part_id": 27,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Achy",
					"slug": "achy",
					"id": 206,
					"sensation_id": 2,
					"body_part_id": 27,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Throbbing",
					"slug": "throbbing",
					"id": 207,
					"sensation_id": 3,
					"body_part_id": 27,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Constant",
					"slug": "constant",
					"id": 208,
					"sensation_id": 4,
					"body_part_id": 27,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Stabbing",
					"slug": "stabbing",
					"id": 209,
					"sensation_id": 5,
					"body_part_id": 27,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Shooting",
					"slug": "shooting",
					"id": 210,
					"sensation_id": 8,
					"body_part_id": 27,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Burning",
					"slug": "burning",
					"id": 211,
					"sensation_id": 9,
					"body_part_id": 27,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  },
				  {
					"name": "Dull",
					"slug": "dull",
					"id": 212,
					"sensation_id": 10,
					"body_part_id": 27,
					"deleted_at": null,
					"created_at": "2020-08-27T08:12:06.000Z",
					"updated_at": "2020-08-27T08:12:06.000Z"
				  }
				]
			  },
			  {
				"id": 35,
				"name": "Left foot",
				"slug": "left_foot",
				"parent_id": 0,
				"created_by": null,
				"updated_by": null,
				"created_at": "2021-01-11T15:29:39.000Z",
				"updated_at": "2021-01-11T15:29:39.000Z",
				"deleted_at": null,
				"body_part_id": 68,
				"position": 5,
				"pain_level": 8,
				"body_part_sensations": [
				  {
					"name": "test_first_sensation",
					"slug": "test5",
					"id": 220,
					"sensation_id": 21,
					"body_part_id": 35,
					"deleted_at": null,
					"created_at": "2021-01-11T15:29:42.000Z",
					"updated_at": "2021-01-11T15:29:42.000Z"
				  }
				]
			  }
			],
			"sensations": [
			  {
				"sensation_id": 1,
				"id": 1,
				"name": "Intermittent Sharp",
				"slug": "intermittent_sharp",
				"deleted_at": null,
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z"
			  },
			  {
				"sensation_id": 2,
				"id": 2,
				"name": "Achy",
				"slug": "achy",
				"deleted_at": null,
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z"
			  },
			  {
				"sensation_id": 3,
				"id": 3,
				"name": "Throbbing",
				"slug": "throbbing",
				"deleted_at": null,
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z"
			  },
			  {
				"sensation_id": 4,
				"id": 4,
				"name": "Constant",
				"slug": "constant",
				"deleted_at": null,
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z"
			  },
			  {
				"sensation_id": 5,
				"id": 5,
				"name": "Stabbing",
				"slug": "stabbing",
				"deleted_at": null,
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z"
			  },
			  {
				"sensation_id": 6,
				"id": 6,
				"name": "Tingling",
				"slug": "tingling",
				"deleted_at": null,
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z"
			  },
			  {
				"sensation_id": 7,
				"id": 7,
				"name": "Numbness",
				"slug": "numbness",
				"deleted_at": null,
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z"
			  },
			  {
				"sensation_id": 8,
				"id": 8,
				"name": "Shooting",
				"slug": "shooting",
				"deleted_at": null,
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z"
			  },
			  {
				"sensation_id": 9,
				"id": 9,
				"name": "Burning",
				"slug": "burning",
				"deleted_at": null,
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z"
			  },
			  {
				"sensation_id": 10,
				"id": 10,
				"name": "Dull",
				"slug": "dull",
				"deleted_at": null,
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z"
			  },
			  {
				"sensation_id": 11,
				"id": 11,
				"name": "Prickling",
				"slug": "prickling",
				"deleted_at": null,
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z"
			  },
			  {
				"sensation_id": 12,
				"id": 12,
				"name": "Pins and Needles",
				"slug": "pins_and_needles",
				"deleted_at": null,
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z"
			  },
			  {
				"sensation_id": 13,
				"id": 13,
				"name": "Other",
				"slug": "other",
				"deleted_at": null,
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z"
			  },
			  {
				"sensation_id": 21,
				"id": 21,
				"name": "test_first_sensation",
				"slug": "test5",
				"deleted_at": null,
				"created_at": "2021-01-11T15:29:40.000Z",
				"updated_at": "2021-01-11T15:29:40.000Z"
			  }
			],
			"categories": [
			  {
				"id": 1,
				"key": null,
				"name": "Medical",
				"slug": "medical",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 2,
				"key": null,
				"name": "Surgical",
				"slug": "surgical",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 3,
				"key": null,
				"name": "Diagnostic",
				"slug": "diagnostic",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  }
			],
			"type": [
			  {
				"id": 1,
				"key": null,
				"name": "WC",
				"slug": "worker_compensation",
				"created_by": 1,
				"updated_by": 1,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-09-17T08:38:52.000Z",
				"deleted_at": null
			  },
			  {
				"id": 2,
				"key": null,
				"name": "NF",
				"slug": "auto_insurance",
				"created_by": 1,
				"updated_by": 1,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-09-17T08:39:17.000Z",
				"deleted_at": null
			  },
			  {
				"id": 3,
				"key": null,
				"name": "Pvt",
				"slug": "private_health_insurance",
				"created_by": 1,
				"updated_by": 1,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-10-23T04:56:57.000Z",
				"deleted_at": null
			  },
			  {
				"id": 4,
				"key": null,
				"name": "Self pay",
				"slug": "self_pay",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 5,
				"key": null,
				"name": "Lien",
				"slug": "lien",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 6,
				"key": null,
				"name": "Corporate",
				"slug": "corporate",
				"created_by": 1,
				"updated_by": 1,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-12-21T12:23:22.000Z",
				"deleted_at": null
			  },
			  {
				"id": 7,
				"key": null,
				"name": "Test Case",
				"slug": "",
				"created_by": 1,
				"updated_by": null,
				"created_at": "2020-09-04T11:00:17.000Z",
				"updated_at": "2020-09-04T11:00:17.000Z",
				"deleted_at": null
			  },
			  {
				"id": 8,
				"key": null,
				"name": "Test case type",
				"slug": "",
				"created_by": 1,
				"updated_by": 1,
				"created_at": "2020-10-07T11:31:32.000Z",
				"updated_at": "2020-10-07T11:39:38.000Z",
				"deleted_at": null
			  },
			  {
				"id": 9,
				"key": null,
				"name": "Testing Visit Type",
				"slug": "",
				"created_by": 1,
				"updated_by": null,
				"created_at": "2020-10-07T11:41:07.000Z",
				"updated_at": "2020-10-07T11:41:07.000Z",
				"deleted_at": null
			  },
			  {
				"id": 10,
				"key": null,
				"name": "Testing Visit Type",
				"slug": "",
				"created_by": 1,
				"updated_by": null,
				"created_at": "2020-10-07T11:41:11.000Z",
				"updated_at": "2020-10-07T11:41:11.000Z",
				"deleted_at": null
			  },
			  {
				"id": 11,
				"key": null,
				"name": "test add new",
				"slug": "",
				"created_by": 45,
				"updated_by": null,
				"created_at": "2020-10-13T05:54:55.000Z",
				"updated_at": "2020-10-13T05:54:55.000Z",
				"deleted_at": null
			  },
			  {
				"id": 12,
				"key": null,
				"name": "eeee",
				"slug": "",
				"created_by": 1,
				"updated_by": null,
				"created_at": "2020-12-01T06:53:55.000Z",
				"updated_at": "2020-12-01T06:53:55.000Z",
				"deleted_at": null
			  },
			  {
				"id": 13,
				"key": null,
				"name": "ffff",
				"slug": "",
				"created_by": 1,
				"updated_by": null,
				"created_at": "2020-12-01T06:54:25.000Z",
				"updated_at": "2020-12-01T06:54:25.000Z",
				"deleted_at": null
			  },
			  {
				"id": 14,
				"key": null,
				"name": "aaaaa",
				"slug": "",
				"created_by": 1,
				"updated_by": 1,
				"created_at": "2020-12-01T07:52:48.000Z",
				"updated_at": "2020-12-21T12:21:24.000Z",
				"deleted_at": null
			  },
			  {
				"id": 15,
				"key": null,
				"name": "bbbbb",
				"slug": "",
				"created_by": 1,
				"updated_by": null,
				"created_at": "2020-12-01T07:52:55.000Z",
				"updated_at": "2020-12-01T07:52:55.000Z",
				"deleted_at": "2020-12-01T12:54:03.000Z"
			  },
			  {
				"id": 16,
				"key": null,
				"name": "asdfsdfdsafadsf",
				"slug": "",
				"created_by": 1,
				"updated_by": 1,
				"created_at": "2020-12-21T11:03:08.000Z",
				"updated_at": "2021-01-08T06:27:50.000Z",
				"deleted_at": null
			  },
			  {
				"id": 17,
				"key": null,
				"name": "yrt",
				"slug": "",
				"created_by": 1,
				"updated_by": 1,
				"created_at": "2020-12-21T11:04:13.000Z",
				"updated_at": "2021-05-06T06:10:58.000Z",
				"deleted_at": null
			  },
			  {
				"id": 18,
				"key": null,
				"name": "gwgt",
				"slug": "",
				"created_by": 1,
				"updated_by": null,
				"created_at": "2020-12-21T11:15:55.000Z",
				"updated_at": "2020-12-21T11:15:55.000Z",
				"deleted_at": null
			  },
			  {
				"id": 20,
				"key": null,
				"name": "fafa",
				"slug": "",
				"created_by": 1,
				"updated_by": 1,
				"created_at": "2021-01-08T06:23:51.000Z",
				"updated_at": "2021-05-06T05:53:25.000Z",
				"deleted_at": null
			  },
			  {
				"id": 21,
				"key": null,
				"name": "789987ds",
				"slug": "",
				"created_by": 1,
				"updated_by": 1,
				"created_at": "2021-01-08T06:26:12.000Z",
				"updated_at": "2021-05-25T12:37:56.000Z",
				"deleted_at": null
			  },
			  {
				"id": 22,
				"key": null,
				"name": "9999",
				"slug": "",
				"created_by": 1,
				"updated_by": 1,
				"created_at": "2021-01-08T14:40:41.000Z",
				"updated_at": "2021-05-06T06:08:00.000Z",
				"deleted_at": null
			  },
			  {
				"id": 23,
				"key": null,
				"name": "NoFault/Workers Comp",
				"slug": "nf_wc",
				"created_by": 1,
				"updated_by": null,
				"created_at": "2021-04-20T11:00:28.000Z",
				"updated_at": "2021-04-20T11:00:28.000Z",
				"deleted_at": null
			  },
			  {
				"id": 24,
				"key": null,
				"name": "dssd",
				"slug": "",
				"created_by": 1,
				"updated_by": null,
				"created_at": "2021-05-06T05:57:01.000Z",
				"updated_at": "2021-05-06T05:57:01.000Z",
				"deleted_at": null
			  },
			  {
				"id": 25,
				"key": null,
				"name": "gfsfsdgdf",
				"slug": "",
				"created_by": 1,
				"updated_by": null,
				"created_at": "2021-05-06T06:22:03.000Z",
				"updated_at": "2021-05-06T06:22:03.000Z",
				"deleted_at": null
			  },
			  {
				"id": 26,
				"key": null,
				"name": "test case name",
				"slug": "",
				"created_by": 1,
				"updated_by": null,
				"created_at": "2021-05-21T06:05:02.000Z",
				"updated_at": "2021-05-21T06:05:02.000Z",
				"deleted_at": null
			  },
			  {
				"id": 27,
				"key": null,
				"name": "new test case",
				"slug": "",
				"created_by": 1,
				"updated_by": null,
				"created_at": "2021-05-21T06:10:29.000Z",
				"updated_at": "2021-05-21T06:10:29.000Z",
				"deleted_at": null
			  },
			  {
				"id": 28,
				"key": null,
				"name": "new test cased",
				"slug": "",
				"created_by": 1,
				"updated_by": null,
				"created_at": "2021-05-25T12:38:43.000Z",
				"updated_at": "2021-05-25T12:38:43.000Z",
				"deleted_at": null
			  }
			],
			"purpose_of_visit": [
			  {
				"id": 1,
				"key": null,
				"name": "I was injured",
				"slug": "i_was_injured",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 2,
				"key": null,
				"name": "Urgent care",
				"slug": "urgent_care",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 3,
				"key": null,
				"name": "Drug testing",
				"slug": "drug_testing",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 4,
				"key": null,
				"name": "Medical clearance",
				"slug": "medical_clearance",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  }
			],
			"languages": [
			  {
				"id": 1,
				"name": "English",
				"slug": "english",
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z",
				"created_by": null,
				"updated_by": null,
				"deleted_at": null
			  },
			  {
				"id": 2,
				"name": "Spanish",
				"slug": "spanish",
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z",
				"created_by": null,
				"updated_by": null,
				"deleted_at": null
			  },
			  {
				"id": 3,
				"name": "Urdu",
				"slug": "urdu",
				"created_at": "2020-08-27T08:12:05.000Z",
				"updated_at": "2020-08-27T08:12:05.000Z",
				"created_by": null,
				"updated_by": null,
				"deleted_at": null
			  }
			],
			"refered_by": [
			  {
				"id": 1,
				"key": null,
				"name": "A Family Member",
				"slug": "a_family_member",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 2,
				"key": null,
				"name": "Patient",
				"slug": "patient",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 3,
				"key": null,
				"name": "A Friend",
				"slug": "a_friend",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 4,
				"key": null,
				"name": "Attorney",
				"slug": "attorney",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 5,
				"key": null,
				"name": "Other",
				"slug": "other",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  }
			],
			"advertisement": [
			  {
				"id": 1,
				"key": null,
				"name": "Social Media",
				"slug": "social_media",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 2,
				"key": null,
				"name": "Google",
				"slug": "google",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 3,
				"key": null,
				"name": "News",
				"slug": "news",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 4,
				"key": null,
				"name": "Radio",
				"slug": "radio",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 5,
				"key": null,
				"name": "Tv",
				"slug": "tv",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  },
			  {
				"id": 6,
				"key": null,
				"name": "Other",
				"slug": "other",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-08-27T08:12:06.000Z",
				"updated_at": "2020-08-27T08:12:06.000Z",
				"deleted_at": null
			  }
			],
			"patient_session_statuses": [
			  {
				"id": 61,
				"key": null,
				"name": "Walk in",
				"slug": "walk_in",
				"created_by": null,
				"updated_by": null,
				"created_at": "2021-02-04T15:42:11.000Z",
				"updated_at": "2021-02-04T15:42:11.000Z",
				"deleted_at": null
			  },
			  {
				"id": 62,
				"key": null,
				"name": "Walk in not seen",
				"slug": "walk_in_not_seen",
				"created_by": null,
				"updated_by": null,
				"created_at": "2021-02-04T15:42:12.000Z",
				"updated_at": "2021-02-04T15:42:12.000Z",
				"deleted_at": null
			  },
			  {
				"id": 63,
				"key": null,
				"name": "Scheduled",
				"slug": "scheduled",
				"created_by": null,
				"updated_by": null,
				"created_at": "2021-02-04T15:42:13.000Z",
				"updated_at": "2021-02-04T15:42:13.000Z",
				"deleted_at": null
			  },
			  {
				"id": 64,
				"key": null,
				"name": "Rescheduled",
				"slug": "re_scheduled",
				"created_by": null,
				"updated_by": null,
				"created_at": "2021-02-04T15:42:13.000Z",
				"updated_at": "2021-02-04T15:42:13.000Z",
				"deleted_at": null
			  },
			  {
				"id": 65,
				"key": null,
				"name": "No Show",
				"slug": "no_show",
				"created_by": null,
				"updated_by": null,
				"created_at": "2021-02-04T15:42:14.000Z",
				"updated_at": "2021-02-04T15:42:14.000Z",
				"deleted_at": null
			  },
			  {
				"id": 66,
				"key": null,
				"name": "Arrived",
				"slug": "arrived",
				"created_by": null,
				"updated_by": null,
				"created_at": "2021-02-04T15:42:15.000Z",
				"updated_at": "2021-02-04T15:42:15.000Z",
				"deleted_at": null
			  },
			  {
				"id": 67,
				"key": null,
				"name": "Completed",
				"slug": "completed",
				"created_by": null,
				"updated_by": null,
				"created_at": "2021-02-04T15:42:16.000Z",
				"updated_at": "2021-02-04T15:42:16.000Z",
				"deleted_at": null
			  },
			  {
				"id": 68,
				"key": null,
				"name": "In Session",
				"slug": "in_session",
				"created_by": null,
				"updated_by": null,
				"created_at": "2021-02-04T15:42:17.000Z",
				"updated_at": "2021-02-04T15:42:17.000Z",
				"deleted_at": null
			  },
			  {
				"id": 69,
				"key": null,
				"name": "Checked in",
				"slug": "checked_in",
				"created_by": null,
				"updated_by": null,
				"created_at": "2021-02-04T15:42:18.000Z",
				"updated_at": "2021-02-04T15:42:18.000Z",
				"deleted_at": null
			  },
			  {
				"id": 70,
				"key": null,
				"name": "Checked out",
				"slug": "checked_out",
				"created_by": null,
				"updated_by": null,
				"created_at": "2021-02-04T15:42:19.000Z",
				"updated_at": "2021-02-04T15:42:19.000Z",
				"deleted_at": null
			  }
			],
			"nf2_generated_by_options": [
			  {
				"id": 1,
				"key": null,
				"name": "Me",
				"slug": "me",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-09-23T07:57:12.000Z",
				"updated_at": "2020-09-23T07:57:12.000Z",
				"deleted_at": null
			  },
			  {
				"id": 2,
				"key": null,
				"name": "Attorney",
				"slug": "attorney",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-09-23T07:57:12.000Z",
				"updated_at": "2020-09-23T07:57:12.000Z",
				"deleted_at": null
			  },
			  {
				"id": 3,
				"key": null,
				"name": "User",
				"slug": "user",
				"created_by": null,
				"updated_by": null,
				"created_at": "2020-09-23T07:57:12.000Z",
				"updated_at": "2020-09-23T07:57:12.000Z",
				"deleted_at": null
			  }
			]
		  }
		}
	  }
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CreateCaseFormComponent],
			imports: [ToastrModule.forRoot(), SharedModule, RouterTestingModule, DynamicFormModule,HttpClientTestingModule ],
			providers: [LocalStorage, Config, Logger],
			schemas: [NO_ERRORS_SCHEMA],
			// providers: [Config, LocalStorage, ReasonCodeService, FormBuilder]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateCaseFormComponent);
		comp = fixture.componentInstance;
	})
	it('Should Create', () => {
		expect(comp).toBeTruthy();
	});
	it('should call get positionon ngOnChanges()',() => {
		spyOn(comp,'getPosition');
		comp.ngOnChanges();
		expect(comp.getPosition).toHaveBeenCalled();
	});
	it('Should set_nf2_generated_by_options_LocalStorageData on ngOnInit with fake call', () => {
		spyOn(comp.storageData,'set_nf2_generated_by_options_LocalStorageData');
		const spy_getQueryParams = spyOn(comp.caseFlowService, 'getCaseMasters').and.returnValue(of(caseMaster_Mock));
		comp.ngOnInit();
		expect(caseMaster_Mock.result.data.nf2_generated_by_options.length).toBeGreaterThan(0);
		expect(comp.storageData.set_nf2_generated_by_options_LocalStorageData).toHaveBeenCalled();
	});
	// it('should call enableForm on OnReady()', () => {
	// 	spyOn(comp, 'enableForm');
	// 	comp.onReady();
	// 	expect(comp.enableForm).toHaveBeenCalled();
	//   });
});

