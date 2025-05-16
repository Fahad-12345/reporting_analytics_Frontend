export enum CaseTypeEnum {
    worker_compensation = 'worker_compensation',
    worker_compensation_employer = 'worker_compensation_employer',
    auto_insurance = 'auto_insurance',
    private_health_insurance = 'private_health_insurance',
    self_pay = 'self_pay',
    lien = 'lien',
    corporate = 'corporate',
	auto_insurance_worker_compensation= 'nf_wc'
}

export enum CaseTypeIdEnum {
    worker_compensation = 1,
    auto_insurance = 2,
    private_health_insurance = 3,
    self_pay = 4,
    lien = 5,
    corporate = 6,
	auto_insurance_worker_compensation = 7,
    worker_compensation_employer = 728,
}

export enum PurposeVisitSlugEnum {
    Speciality = "speciality",
   
}

// {
//     "message": "success",
//     "status": 200,
//     "data": [
//         {
//             "id": 1,
//             "key": null,
//             "name": "Worker compensation",
//             "slug": "worker_compensation",
//             "created_by": null,
//             "updated_by": null,
//             "created_at": "2020-01-29T07:19:43.000Z",
//             "updated_at": "2020-01-29T07:19:43.000Z",
//             "deleted_at": null
//         },
//         {
//             "id": 2,
//             "key": null,
//             "name": "Auto insurance",
//             "slug": "auto_insurance",
//             "created_by": null,
//             "updated_by": null,
//             "created_at": "2020-01-29T07:19:43.000Z",
//             "updated_at": "2020-01-29T07:19:43.000Z",
//             "deleted_at": null
//         },
//         {
//             "id": 3,
//             "key": null,
//             "name": "Private health insurance",
//             "slug": "private_health_insurance",
//             "created_by": null,
//             "updated_by": null,
//             "created_at": "2020-01-29T07:19:43.000Z",
//             "updated_at": "2020-01-29T07:19:43.000Z",
//             "deleted_at": null
//         },
//         {
//             "id": 4,
//             "key": null,
//             "name": "Self pay",
//             "slug": "self_pay",
//             "created_by": null,
//             "updated_by": null,
//             "created_at": "2020-01-29T07:19:43.000Z",
//             "updated_at": "2020-01-29T07:19:43.000Z",
//             "deleted_at": null
//         },
//         {
//             "id": 5,
//             "key": null,
//             "name": "Lien",
//             "slug": "lien",
//             "created_by": null,
//             "updated_by": null,
//             "created_at": "2020-01-29T07:19:43.000Z",
//             "updated_at": "2020-01-29T07:19:43.000Z",
//             "deleted_at": null
//         },
//         {
//             "id": 6,
//             "key": null,
//             "name": "Corporate",
//             "slug": "corporate",
//             "created_by": null,
//             "updated_by": null,
//             "created_at": "2020-01-29T07:19:43.000Z",
//             "updated_at": "2020-01-29T07:19:43.000Z",
//             "deleted_at": null
//         }
//     ]
// }
