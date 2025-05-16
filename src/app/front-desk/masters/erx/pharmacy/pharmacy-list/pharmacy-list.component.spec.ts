import { of } from 'rxjs';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { Config } from '@appDir/config/config';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from '@appDir/shared/shared.module';
import { TestBed, async, ComponentFixture, inject, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PharmacyListComponent } from './pharmacy-list.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe(("PharmacyListComponent"), () => {
	let comp: PharmacyListComponent;
	let fixture: ComponentFixture<PharmacyListComponent>;
	let pharmacyList_Mock = [
		{
			"id": 21,
			"ncpdp_id": "0000007",
			"store_no": "0007",
			"organization_name": "QAINTERFACE",
			"address_line1": "LINDBERG DR",
			"address_line2": null,
			"city": "CORAOPOLIS",
			"state_province": "PA",
			"postal_code": "15108",
			"country_code": "US",
			"standardized_address_line1": "Lindberg Dr",
			"standardized_address_line2": null,
			"standardized_city": "Coraopolis",
			"standardized_state_province": "PA",
			"standardized_postal": "15108",
			"primary_telephone": "4124741167",
			"primary_telephone_ext": null,
			"primary_telephone_support_sms": null,
			"is_active": 1,
			"fax": "4124741074",
			"fax_ext": null,
			"fax_support_sms": null,
			"electronic_mail": null,
			"active_start_time": "2010-08-20 00:00:00",
			"active_end_time": "2099-12-31 00:00:00",
			"partner_account": null,
			"last_modified_date": "2018-11-13 19:21:41",
			"cross_street": null,
			"record_change": null,
			"old_service_level": null,
			"version": "v10_6",
			"npi": "1234524316",
			"replace_ncpdp_id": null,
			"state_license_number": null,
			"upin": null,
			"facility_id": null,
			"medicare_number": null,
			"medicaid_number": null,
			"payer_id": null,
			"dea_number": "AS9999991",
			"hin": null,
			"mutually_defined": "sure it is",
			"direct_address": null,
			"organization_type": "Pharmacy",
			"organization_id": "17",
			"parent_organization_id": null,
			"latitude": "40.50414800",
			"longitude": "-80.19637900",
			"precise": 0,
			"use_case": "\r\n",
			"erx_service_levels": [
				{
					"id": 1,
					"name": "New",
					"slug": "new",
					"pivot": {
						"pharmacy_id": 21,
						"service_level_id": 1
					}
				},
				{
					"id": 2,
					"name": "Refill",
					"slug": "refill",
					"pivot": {
						"pharmacy_id": 21,
						"service_level_id": 2
					}
				},
				{
					"id": 5,
					"name": "ControlledSubstance",
					"slug": "controlled_substance",
					"pivot": {
						"pharmacy_id": 21,
						"service_level_id": 5
					}
				}
			],
			"erx_organization_types": [
				{
					"id": 2,
					"name": "Retail",
					"slug": "retail",
					"pivot": {
						"pharmacy_id": 21,
						"organization_type_id": 2
					}
				}
			],
			"alternate_phones": []
		},
		{
			"id": 22,
			"ncpdp_id": "0000010",
			"store_no": null,
			"organization_name": "QA23-EF",
			"address_line1": "30881 SCHOOLCRAFT",
			"address_line2": null,
			"city": "LIVONIA",
			"state_province": "MI",
			"postal_code": "48150",
			"country_code": "US",
			"standardized_address_line1": "30881 Schoolcraft Rd",
			"standardized_address_line2": null,
			"standardized_city": "Livonia",
			"standardized_state_province": "MI",
			"standardized_postal": "481502010",
			"primary_telephone": "4124748916",
			"primary_telephone_ext": null,
			"primary_telephone_support_sms": null,
			"is_active": 1,
			"fax": "4124741000",
			"fax_ext": null,
			"fax_support_sms": null,
			"electronic_mail": null,
			"active_start_time": "2010-03-03 09:00:00",
			"active_end_time": "2099-12-30 09:00:00",
			"partner_account": null,
			"last_modified_date": "2018-11-13 19:21:41",
			"cross_street": null,
			"record_change": null,
			"old_service_level": null,
			"version": "v10_6",
			"npi": "4564564563",
			"replace_ncpdp_id": null,
			"state_license_number": null,
			"upin": null,
			"facility_id": null,
			"medicare_number": null,
			"medicaid_number": "85858585",
			"payer_id": null,
			"dea_number": "JO5489364",
			"hin": null,
			"mutually_defined": null,
			"direct_address": null,
			"organization_type": "Pharmacy",
			"organization_id": "23",
			"parent_organization_id": null,
			"latitude": "42.38262000",
			"longitude": "-83.34703000",
			"precise": 1,
			"use_case": "\r\n",
			"erx_service_levels": [
				{
					"id": 1,
					"name": "New",
					"slug": "new",
					"pivot": {
						"pharmacy_id": 22,
						"service_level_id": 1
					}
				},
				{
					"id": 2,
					"name": "Refill",
					"slug": "refill",
					"pivot": {
						"pharmacy_id": 22,
						"service_level_id": 2
					}
				},
				{
					"id": 4,
					"name": "Cancel",
					"slug": "cancel",
					"pivot": {
						"pharmacy_id": 22,
						"service_level_id": 4
					}
				},
				{
					"id": 5,
					"name": "ControlledSubstance",
					"slug": "controlled_substance",
					"pivot": {
						"pharmacy_id": 22,
						"service_level_id": 5
					}
				}
			],
			"erx_organization_types": [
				{
					"id": 2,
					"name": "Retail",
					"slug": "retail",
					"pivot": {
						"pharmacy_id": 22,
						"organization_type_id": 2
					}
				}
			],
			"alternate_phones": []
		},
		{
			"id": 23,
			"ncpdp_id": "0000011",
			"store_no": null,
			"organization_name": "QA23-PT1",
			"address_line1": "30881 SCHOOLCRAFT",
			"address_line2": null,
			"city": "LIVONIA",
			"state_province": "OK",
			"postal_code": "56781",
			"country_code": "US",
			"standardized_address_line1": "30881 Schoolcraft",
			"standardized_address_line2": null,
			"standardized_city": "Livonia",
			"standardized_state_province": "OK",
			"standardized_postal": "56781",
			"primary_telephone": "4124741158",
			"primary_telephone_ext": null,
			"primary_telephone_support_sms": null,
			"is_active": 1,
			"fax": "4124741000",
			"fax_ext": null,
			"fax_support_sms": null,
			"electronic_mail": null,
			"active_start_time": "2010-03-03 04:00:00",
			"active_end_time": "2099-12-30 04:00:00",
			"partner_account": null,
			"last_modified_date": "2018-11-13 19:21:41",
			"cross_street": null,
			"record_change": null,
			"old_service_level": null,
			"version": "v10_6",
			"npi": "6784568902",
			"replace_ncpdp_id": null,
			"state_license_number": null,
			"upin": null,
			"facility_id": null,
			"medicare_number": null,
			"medicaid_number": null,
			"payer_id": null,
			"dea_number": "AS9999991",
			"hin": null,
			"mutually_defined": null,
			"direct_address": null,
			"organization_type": "Pharmacy",
			"organization_id": "25",
			"parent_organization_id": null,
			"latitude": null,
			"longitude": null,
			"precise": 0,
			"use_case": "\r\n",
			"erx_service_levels": [
				{
					"id": 1,
					"name": "New",
					"slug": "new",
					"pivot": {
						"pharmacy_id": 23,
						"service_level_id": 1
					}
				},
				{
					"id": 2,
					"name": "Refill",
					"slug": "refill",
					"pivot": {
						"pharmacy_id": 23,
						"service_level_id": 2
					}
				},
				{
					"id": 4,
					"name": "Cancel",
					"slug": "cancel",
					"pivot": {
						"pharmacy_id": 23,
						"service_level_id": 4
					}
				},
				{
					"id": 5,
					"name": "ControlledSubstance",
					"slug": "controlled_substance",
					"pivot": {
						"pharmacy_id": 23,
						"service_level_id": 5
					}
				}
			],
			"erx_organization_types": [
				{
					"id": 2,
					"name": "Retail",
					"slug": "retail",
					"pivot": {
						"pharmacy_id": 23,
						"organization_type_id": 2
					}
				}
			],
			"alternate_phones": []
		},
		{
			"id": 24,
			"ncpdp_id": "0000017",
			"store_no": null,
			"organization_name": "PPI INTERFACE STORE",
			"address_line1": "1 IRV STORE",
			"address_line2": null,
			"city": "CORAOPOLIS",
			"state_province": "PA",
			"postal_code": "15108",
			"country_code": "US",
			"standardized_address_line1": "1 Irv Store",
			"standardized_address_line2": null,
			"standardized_city": "Coraopolis",
			"standardized_state_province": "PA",
			"standardized_postal": "15108",
			"primary_telephone": "4124741054",
			"primary_telephone_ext": null,
			"primary_telephone_support_sms": null,
			"is_active": 1,
			"fax": "4124741000",
			"fax_ext": null,
			"fax_support_sms": null,
			"electronic_mail": null,
			"active_start_time": "2011-06-20 00:00:00",
			"active_end_time": "2099-12-31 00:00:00",
			"partner_account": null,
			"last_modified_date": "2018-11-13 19:21:41",
			"cross_street": null,
			"record_change": null,
			"old_service_level": null,
			"version": "v10_6",
			"npi": "1234524324",
			"replace_ncpdp_id": null,
			"state_license_number": null,
			"upin": null,
			"facility_id": null,
			"medicare_number": null,
			"medicaid_number": null,
			"payer_id": null,
			"dea_number": "PP1111119",
			"hin": null,
			"mutually_defined": null,
			"direct_address": null,
			"organization_type": "Pharmacy",
			"organization_id": "31",
			"parent_organization_id": null,
			"latitude": "40.50414800",
			"longitude": "-80.19637900",
			"precise": 0,
			"use_case": "\r\n",
			"erx_service_levels": [
				{
					"id": 1,
					"name": "New",
					"slug": "new",
					"pivot": {
						"pharmacy_id": 24,
						"service_level_id": 1
					}
				},
				{
					"id": 2,
					"name": "Refill",
					"slug": "refill",
					"pivot": {
						"pharmacy_id": 24,
						"service_level_id": 2
					}
				},
				{
					"id": 5,
					"name": "ControlledSubstance",
					"slug": "controlled_substance",
					"pivot": {
						"pharmacy_id": 24,
						"service_level_id": 5
					}
				}
			],
			"erx_organization_types": [
				{
					"id": 2,
					"name": "Retail",
					"slug": "retail",
					"pivot": {
						"pharmacy_id": 24,
						"organization_type_id": 2
					}
				}
			],
			"alternate_phones": []
		},
		{
			"id": 25,
			"ncpdp_id": "0000018",
			"store_no": "008",
			"organization_name": "PPI FACILITY",
			"address_line1": "345 PPI DRIVE",
			"address_line2": "West Wing",
			"city": "CORAOPOLIS",
			"state_province": "PA",
			"postal_code": "15108",
			"country_code": "US",
			"standardized_address_line1": "345 PPI DRIVE",
			"standardized_address_line2": null,
			"standardized_city": "Coraopolis",
			"standardized_state_province": "PA",
			"standardized_postal": "15108",
			"primary_telephone": "4124551056",
			"primary_telephone_ext": null,
			"primary_telephone_support_sms": null,
			"is_active": 1,
			"fax": "4124741000",
			"fax_ext": null,
			"fax_support_sms": null,
			"electronic_mail": "ppipharmacy@something.com",
			"active_start_time": "2011-04-12 00:00:00",
			"active_end_time": "2099-12-31 00:00:00",
			"partner_account": null,
			"last_modified_date": "2018-11-13 19:21:41",
			"cross_street": "Business 376",
			"record_change": null,
			"old_service_level": null,
			"version": "v10_6",
			"npi": "1234567893",
			"replace_ncpdp_id": null,
			"state_license_number": "StateLic",
			"upin": null,
			"facility_id": null,
			"medicare_number": "Medicare",
			"medicaid_number": "Medicaid",
			"payer_id": "PayerID",
			"dea_number": "PP5489263",
			"hin": "HIN",
			"mutually_defined": "MutuallyDe",
			"direct_address": null,
			"organization_type": "Pharmacy",
			"organization_id": "33",
			"parent_organization_id": null,
			"latitude": "40.50414800",
			"longitude": "-80.19637900",
			"precise": 0,
			"use_case": "\r\n",
			"erx_service_levels": [
				{
					"id": 1,
					"name": "New",
					"slug": "new",
					"pivot": {
						"pharmacy_id": 25,
						"service_level_id": 1
					}
				},
				{
					"id": 2,
					"name": "Refill",
					"slug": "refill",
					"pivot": {
						"pharmacy_id": 25,
						"service_level_id": 2
					}
				},
				{
					"id": 4,
					"name": "Cancel",
					"slug": "cancel",
					"pivot": {
						"pharmacy_id": 25,
						"service_level_id": 4
					}
				},
				{
					"id": 5,
					"name": "ControlledSubstance",
					"slug": "controlled_substance",
					"pivot": {
						"pharmacy_id": 25,
						"service_level_id": 5
					}
				}
			],
			"erx_organization_types": [
				{
					"id": 2,
					"name": "Retail",
					"slug": "retail",
					"pivot": {
						"pharmacy_id": 25,
						"organization_type_id": 2
					}
				}
			],
			"alternate_phones": [
				{
					"id": 55129,
					"pharmacy_id": 25,
					"qualifier": "WP",
					"phone_number": "4128889999",
					"phone_number_ext": null,
					"phone_number_support_sms": null
				},
				{
					"id": 55130,
					"pharmacy_id": 25,
					"qualifier": "TP",
					"phone_number": "4126664444",
					"phone_number_ext": null,
					"phone_number_support_sms": null
				},
				{
					"id": 55131,
					"pharmacy_id": 25,
					"qualifier": "BN",
					"phone_number": "4125553333",
					"phone_number_ext": null,
					"phone_number_support_sms": null
				},
				{
					"id": 55132,
					"pharmacy_id": 25,
					"qualifier": "HP",
					"phone_number": "4124442222",
					"phone_number_ext": null,
					"phone_number_support_sms": null
				},
				{
					"id": 55133,
					"pharmacy_id": 25,
					"qualifier": "TP",
					"phone_number": "4123331111",
					"phone_number_ext": null,
					"phone_number_support_sms": null
				}
			]
		},
		{
			"id": 26,
			"ncpdp_id": "0000020",
			"store_no": "00020",
			"organization_name": "CVS HEALTH #00020",
			"address_line1": "One CVS Drive",
			"address_line2": "Suite 210",
			"city": "Westlake",
			"state_province": "OR",
			"postal_code": "44145",
			"country_code": "US",
			"standardized_address_line1": "One Cvs Drive",
			"standardized_address_line2": null,
			"standardized_city": "Westlake",
			"standardized_state_province": "OH",
			"standardized_postal": "44145",
			"primary_telephone": "4017700020",
			"primary_telephone_ext": null,
			"primary_telephone_support_sms": null,
			"is_active": 1,
			"fax": "4017704353",
			"fax_ext": null,
			"fax_support_sms": null,
			"electronic_mail": null,
			"active_start_time": "2016-10-24 21:04:20",
			"active_end_time": "2099-12-31 00:00:00",
			"partner_account": null,
			"last_modified_date": "2019-07-16 16:36:34",
			"cross_street": null,
			"record_change": null,
			"old_service_level": null,
			"version": "v6_1_erx",
			"npi": "1104923507",
			"replace_ncpdp_id": null,
			"state_license_number": null,
			"upin": null,
			"facility_id": null,
			"medicare_number": null,
			"medicaid_number": null,
			"payer_id": null,
			"dea_number": null,
			"hin": null,
			"mutually_defined": null,
			"direct_address": null,
			"organization_type": "Pharmacy",
			"organization_id": "489117",
			"parent_organization_id": null,
			"latitude": "41.45530000",
			"longitude": "-81.92550000",
			"precise": 0,
			"use_case": "\r\n",
			"erx_service_levels": [
				{
					"id": 1,
					"name": "New",
					"slug": "new",
					"pivot": {
						"pharmacy_id": 26,
						"service_level_id": 1
					}
				},
				{
					"id": 2,
					"name": "Refill",
					"slug": "refill",
					"pivot": {
						"pharmacy_id": 26,
						"service_level_id": 2
					}
				},
				{
					"id": 3,
					"name": "Change",
					"slug": "change",
					"pivot": {
						"pharmacy_id": 26,
						"service_level_id": 3
					}
				},
				{
					"id": 4,
					"name": "Cancel",
					"slug": "cancel",
					"pivot": {
						"pharmacy_id": 26,
						"service_level_id": 4
					}
				},
				{
					"id": 5,
					"name": "ControlledSubstance",
					"slug": "controlled_substance",
					"pivot": {
						"pharmacy_id": 26,
						"service_level_id": 5
					}
				}
			],
			"erx_organization_types": [
				{
					"id": 2,
					"name": "Retail",
					"slug": "retail",
					"pivot": {
						"pharmacy_id": 26,
						"organization_type_id": 2
					}
				}
			],
			"alternate_phones": []
		},
		{
			"id": 27,
			"ncpdp_id": "0000021",
			"store_no": "00021",
			"organization_name": "00021",
			"address_line1": "1117 10TH ST",
			"address_line2": null,
			"city": "WASHINGTON",
			"state_province": "TX",
			"postal_code": "75801",
			"country_code": "US",
			"standardized_address_line1": "1117 10th St",
			"standardized_address_line2": null,
			"standardized_city": "Washington",
			"standardized_state_province": "TX",
			"standardized_postal": "75801",
			"primary_telephone": "4017707046",
			"primary_telephone_ext": null,
			"primary_telephone_support_sms": null,
			"is_active": 1,
			"fax": "4017702153",
			"fax_ext": null,
			"fax_support_sms": null,
			"electronic_mail": null,
			"active_start_time": "2011-07-04 08:00:00",
			"active_end_time": "2099-12-30 04:00:00",
			"partner_account": null,
			"last_modified_date": "2018-11-13 19:21:41",
			"cross_street": null,
			"record_change": null,
			"old_service_level": null,
			"version": "v10_6",
			"npi": "1104923507",
			"replace_ncpdp_id": null,
			"state_license_number": null,
			"upin": null,
			"facility_id": null,
			"medicare_number": null,
			"medicaid_number": null,
			"payer_id": null,
			"dea_number": null,
			"hin": null,
			"mutually_defined": null,
			"direct_address": null,
			"organization_type": "Pharmacy",
			"organization_id": "35",
			"parent_organization_id": null,
			"latitude": "31.73880000",
			"longitude": "-95.61553500",
			"precise": 0,
			"use_case": "\r\n",
			"erx_service_levels": [
				{
					"id": 1,
					"name": "New",
					"slug": "new",
					"pivot": {
						"pharmacy_id": 27,
						"service_level_id": 1
					}
				}
			],
			"erx_organization_types": [
				{
					"id": 2,
					"name": "Retail",
					"slug": "retail",
					"pivot": {
						"pharmacy_id": 27,
						"organization_type_id": 2
					}
				}
			],
			"alternate_phones": []
		},
		{
			"id": 28,
			"ncpdp_id": "0000069",
			"store_no": null,
			"organization_name": "Do notuse00069",
			"address_line1": "One CVS Drive",
			"address_line2": null,
			"city": "Palestine",
			"state_province": "TX",
			"postal_code": "75801",
			"country_code": "US",
			"standardized_address_line1": "One Cvs Drive",
			"standardized_address_line2": null,
			"standardized_city": "Palestine",
			"standardized_state_province": "TX",
			"standardized_postal": "75801",
			"primary_telephone": "4017705841",
			"primary_telephone_ext": null,
			"primary_telephone_support_sms": null,
			"is_active": 1,
			"fax": "4017705843",
			"fax_ext": null,
			"fax_support_sms": null,
			"electronic_mail": null,
			"active_start_time": "2012-10-04 00:00:00",
			"active_end_time": "2099-12-31 00:00:00",
			"partner_account": null,
			"last_modified_date": "2018-11-13 19:21:41",
			"cross_street": null,
			"record_change": null,
			"old_service_level": null,
			"version": "v10_6",
			"npi": "1104923507",
			"replace_ncpdp_id": null,
			"state_license_number": null,
			"upin": null,
			"facility_id": null,
			"medicare_number": null,
			"medicaid_number": null,
			"payer_id": null,
			"dea_number": null,
			"hin": null,
			"mutually_defined": null,
			"direct_address": null,
			"organization_type": "Pharmacy",
			"organization_id": "39",
			"parent_organization_id": null,
			"latitude": "31.74411200",
			"longitude": "-95.61807800",
			"precise": 0,
			"use_case": "\r\n",
			"erx_service_levels": [
				{
					"id": 1,
					"name": "New",
					"slug": "new",
					"pivot": {
						"pharmacy_id": 28,
						"service_level_id": 1
					}
				},
				{
					"id": 2,
					"name": "Refill",
					"slug": "refill",
					"pivot": {
						"pharmacy_id": 28,
						"service_level_id": 2
					}
				},
				{
					"id": 3,
					"name": "Change",
					"slug": "change",
					"pivot": {
						"pharmacy_id": 28,
						"service_level_id": 3
					}
				},
				{
					"id": 4,
					"name": "Cancel",
					"slug": "cancel",
					"pivot": {
						"pharmacy_id": 28,
						"service_level_id": 4
					}
				},
				{
					"id": 5,
					"name": "ControlledSubstance",
					"slug": "controlled_substance",
					"pivot": {
						"pharmacy_id": 28,
						"service_level_id": 5
					}
				}
			],
			"erx_organization_types": [
				{
					"id": 2,
					"name": "Retail",
					"slug": "retail",
					"pivot": {
						"pharmacy_id": 28,
						"organization_type_id": 2
					}
				}
			],
			"alternate_phones": []
		},
		{
			"id": 29,
			"ncpdp_id": "0000097",
			"store_no": null,
			"organization_name": "Health Partners - Test Store 97",
			"address_line1": "8170 33RD AVE S",
			"address_line2": null,
			"city": "bloomington",
			"state_province": "MN",
			"postal_code": "55425",
			"country_code": "US",
			"standardized_address_line1": "8170 33rd Ave S",
			"standardized_address_line2": null,
			"standardized_city": "Bloomington",
			"standardized_state_province": "MN",
			"standardized_postal": "554251614",
			"primary_telephone": "9529676905",
			"primary_telephone_ext": null,
			"primary_telephone_support_sms": null,
			"is_active": 1,
			"fax": "8774053516",
			"fax_ext": null,
			"fax_support_sms": null,
			"electronic_mail": null,
			"active_start_time": "2013-10-11 02:00:00",
			"active_end_time": "2099-12-30 12:00:00",
			"partner_account": null,
			"last_modified_date": "2020-06-04 19:52:26",
			"cross_street": null,
			"record_change": null,
			"old_service_level": null,
			"version": "v6_1_erx",
			"npi": null,
			"replace_ncpdp_id": null,
			"state_license_number": null,
			"upin": null,
			"facility_id": null,
			"medicare_number": null,
			"medicaid_number": null,
			"payer_id": null,
			"dea_number": null,
			"hin": null,
			"mutually_defined": null,
			"direct_address": null,
			"organization_type": "Pharmacy",
			"organization_id": "2554",
			"parent_organization_id": null,
			"latitude": "44.85587900",
			"longitude": "-93.22536100",
			"precise": 1,
			"use_case": "\r\n",
			"erx_service_levels": [
				{
					"id": 1,
					"name": "New",
					"slug": "new",
					"pivot": {
						"pharmacy_id": 29,
						"service_level_id": 1
					}
				},
				{
					"id": 2,
					"name": "Refill",
					"slug": "refill",
					"pivot": {
						"pharmacy_id": 29,
						"service_level_id": 2
					}
				},
				{
					"id": 4,
					"name": "Cancel",
					"slug": "cancel",
					"pivot": {
						"pharmacy_id": 29,
						"service_level_id": 4
					}
				}
			],
			"erx_organization_types": [
				{
					"id": 2,
					"name": "Retail",
					"slug": "retail",
					"pivot": {
						"pharmacy_id": 29,
						"organization_type_id": 2
					}
				}
			],
			"alternate_phones": []
		},
		{
			"id": 30,
			"ncpdp_id": "0000117",
			"store_no": "117",
			"organization_name": "John Spartan Pharmacy",
			"address_line1": "117 Reach Rd",
			"address_line2": null,
			"city": "Harvest",
			"state_province": "AL",
			"postal_code": "35749",
			"country_code": "US",
			"standardized_address_line1": "117 Reach Rd",
			"standardized_address_line2": null,
			"standardized_city": "Harvest",
			"standardized_state_province": "AL",
			"standardized_postal": "35749",
			"primary_telephone": "2565551212",
			"primary_telephone_ext": null,
			"primary_telephone_support_sms": null,
			"is_active": 1,
			"fax": "2565551414",
			"fax_ext": null,
			"fax_support_sms": null,
			"electronic_mail": null,
			"active_start_time": "2010-05-20 00:00:00",
			"active_end_time": "2099-12-31 00:00:00",
			"partner_account": null,
			"last_modified_date": "2018-11-13 19:21:41",
			"cross_street": null,
			"record_change": null,
			"old_service_level": null,
			"version": "v4_20",
			"npi": null,
			"replace_ncpdp_id": null,
			"state_license_number": null,
			"upin": null,
			"facility_id": null,
			"medicare_number": null,
			"medicaid_number": null,
			"payer_id": null,
			"dea_number": "0000117",
			"hin": null,
			"mutually_defined": null,
			"direct_address": null,
			"organization_type": "Pharmacy",
			"organization_id": "45",
			"parent_organization_id": null,
			"latitude": "34.81653000",
			"longitude": "-86.76094200",
			"precise": 0,
			"use_case": "\r\n",
			"erx_service_levels": [
				{
					"id": 1,
					"name": "New",
					"slug": "new",
					"pivot": {
						"pharmacy_id": 30,
						"service_level_id": 1
					}
				},
				{
					"id": 2,
					"name": "Refill",
					"slug": "refill",
					"pivot": {
						"pharmacy_id": 30,
						"service_level_id": 2
					}
				}
			],
			"erx_organization_types": [],
			"alternate_phones": []
		}
	]
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [PharmacyListComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [RouterTestingModule, ToastrModule.forRoot(), SharedModule,HttpClientTestingModule],
			providers: [LocalStorage, Config]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PharmacyListComponent);
		comp = fixture.componentInstance;
	})
	it('Should Create', () => {
		expect(comp).toBeTruthy();
	});
	it('Check getQueryParams is called from ngOnInit', () => {
		const spy_getQueryParams = spyOn(comp, 'getQueryParams');
		comp.ngOnInit();
		expect(spy_getQueryParams).toHaveBeenCalled();
	});
	it('Should get_pharmacy_data function call and get pharmacy list', fakeAsync(() => {
		// spyOn(component.requestService, 'sendRequest').and.returnValue(of(fakePacketList))
		const spy_getQueryParams = spyOn(comp, 'get_pharmacy_data').and.returnValue(of(pharmacyList_Mock));
		const queryParams = {
			page: 1,
			per_page: 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		comp.pharmacy_list = pharmacyList_Mock;
		comp.get_pharmacy_data(queryParams);
		tick();
		expect(comp.pharmacy_list.length).toEqual(pharmacyList_Mock.length);
		expect(spy_getQueryParams).toHaveBeenCalledWith(queryParams);
		expect(comp.pharmacy_list).toEqual(pharmacyList_Mock);

	}));
	it('should call pharmacy_detail_open_modal fun on view', () => {
		spyOn(comp, 'getPharmacyByID');
		comp.pharmacy_detail_open_modal(pharmacyList_Mock[0], 'view', 'content');
		expect(comp.getPharmacyByID).toHaveBeenCalledWith(pharmacyList_Mock[0], 'view', 'content');
	})
});

