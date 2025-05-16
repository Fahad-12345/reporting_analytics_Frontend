import { Feelings, BodyPart, Sensation, Radiation, SubBodyPart, PainExacerbationReasons, Diseases, Allergies, BodyPartCondition, ConditionStates, BodyPartCodes, Devices } from "./initialEvaluationModels";

export const ALLERGIES: Allergies[] = [
    new Allergies({
        "id": 1,
        "allergy": "NKDA"
    }),
    new Allergies({
        "id": 2,
        "allergy": "Novocaine"
    }),

    new Allergies({
        "id": 3,
        "allergy": "Penicillin"
    }),

    new Allergies({
        "id": 4,
        "allergy": "Iodine"
    }),

    new Allergies({
        "id": 5,
        "allergy": "Aspirin"
    }),

    new Allergies({
        "id": 6,
        "allergy": "Tape"
    }),

    new Allergies({
        "id": 7,
        "allergy": "Codeine"
    }),
    new Allergies({
        "id": 8,
        "allergy": "Other"
    }),

];
export const DISEASES: Diseases[] = [
    new Diseases({
        "id": 1,
        "disease": "None"
    }),
    new Diseases({
        "id": 2,
        "disease": "Diabetes"
    }),
    new Diseases({
        "id": 3,
        "disease": "Seizures"
    }),
    new Diseases({
        "id": 4,
        "disease": "Thyroid Disorder"
    }),
    new Diseases({
        "id": 5,
        "disease": "Bleeding Disorder"
    }),
    new Diseases({
        "id": 6,
        "disease": "Hiatal Hernia"
    }),
    new Diseases({
        "id": 7,
        "disease": "Osteoporosis"
    }),
    new Diseases({
        "id": 8,
        "disease": "Dyslipidemia"
    }),
    new Diseases({
        "id": 9,
        "disease": "High Blood Pressure"
    }),
    new Diseases({
        "id": 10,
        "disease": "Stroke/TIA’s"
    }),
    new Diseases({
        "id": 11,
        "disease": "Mitral Valve Prolapse"
    }),
    new Diseases({
        "id": 12,
        "disease": "Ulcers"
    }),
    new Diseases({
        "id": 13,
        "disease": "Cirrhosis"
    }),
    new Diseases({
        "id": 14,
        "disease": "Depression/Anxiety"
    }),
    new Diseases({
        "id": 15,
        "disease": "Angina/Chest Pain"
    }),
    new Diseases({
        "id": 16,
        "disease": "Asthma"
    }),
    new Diseases({
        "id": 17,
        "disease": "Angioplasty"
    }),
    new Diseases({
        "id": 18,
        "disease": "Circulation Disorder"
    }),
    new Diseases({
        "id": 19,
        "disease": "Back Pain"
    }),
    new Diseases({
        "id": 19,
        "disease": "Back Pain"
    }),
    new Diseases({
        "id": 20,
        "disease": "DVT/PE"
    }),
    new Diseases({
        "id": 21,
        "disease": "Heart Attack"
    }),
    new Diseases({
        "id": 22,
        "disease": "Hepatitis"
    }),
    new Diseases({
        "id": 23,
        "disease": "Kidney disorder"
    }),
    new Diseases({
        "id": 24,
        "disease": "Anemia"
    }),
    new Diseases({
        "id": 25,
        "disease": "Arthritis"
    }),
    new Diseases({
        "id": 26,
        "disease": "Cancer"
    })

];
export const BODYPART: BodyPart[] = [
    new BodyPart({
        "id": 1,
        "name": "neck",
        "type": "complaints",
        // "codes":[new BodyPartCodes({id:1,code:"codes-neck"}), new BodyPartCodes({id:101,code:"codes-neck 2"})],
    }),
    new BodyPart({
        "id": 2,
        "name": "back",
        "type": "complaints",
        // "codes":[new BodyPartCodes({id:2,code:"codes-back"}), new BodyPartCodes({id:102,code:"codes-back 2"})],
    }),
    new BodyPart({
        "id": 3,
        "name": "shoulder(s)",
        "type": "complaints",
        // "codes":[new BodyPartCodes({id:3,code:"codes-shoulder"}), new BodyPartCodes({id:103,code:"codes-shoulder 2"})],
    }),
    new BodyPart({
        "id": 4,
        "name": "hip",
        "type": "complaints",
        // "codes":[new BodyPartCodes({id:4,code:"codes-hip"}), new BodyPartCodes({id:104,code:"codes-hip"})],
    }),
    new BodyPart({
        "id": 5,
        "name": "knee",
        "type": "complaints",
        // "codes":[new BodyPartCodes({id:5,code:"codes-knee"}), new BodyPartCodes({id:105,code:"codes-knee"})],
    }),
    new BodyPart({
        "id": 6,
        "name": "arm",
        "type": "description",
        // "codes":[new BodyPartCodes({id:6,code:"codes-arm"}), new BodyPartCodes({id:106,code:"codes-arm"})],
    }),
    new BodyPart({
        "id": 7,
        "name": "leg",
        "type": "description",
        // "codes":[new BodyPartCodes({id:7,code:"codes-leg"}), new BodyPartCodes({id:107,code:"codes-leg"})],
    }),
    new BodyPart({
        "id": 8,
        "name": "head",
        "type": "physicalExamination",
        // "codes":[new BodyPartCodes({id:8,code:"codes-head"}), new BodyPartCodes({id:108,code:"codes-head"})],
    }),
    new BodyPart({
        "id": 9,
        "name": "eyes",
        "type": "physicalExamination",
        // "codes":[new BodyPartCodes({id:9,code:"codes-eyes"}), new BodyPartCodes({id:109,code:"codes-eyes"})],
    }),
    new BodyPart({
        "id": 10,
        "name": "chest",
        "type": "physicalExamination",
        // "codes":[new BodyPartCodes({id:10,code:"codes-chest"}), new BodyPartCodes({id:1010,code:"codes-chest"})],
    }),
    new BodyPart({
        "id": 11,
        "name": "heart",
        "type": "physicalExamination",
        // "codes":[new BodyPartCodes({id:11,code:"codes-heart"}), new BodyPartCodes({id:1011,code:"codes-heart"})],
    }),
    new BodyPart({
        "id": 12,
        "name": "abdomen",
        "type": "physicalExamination",
        // "codes":[new BodyPartCodes({id:12,code:"codes-abdomen"}), new BodyPartCodes({id:1012,code:"codes-abdomen"})],
    }),
    new BodyPart({
        "id": 13,
        "name": "back",
        "type": "physicalExamination",
        // "codes":[new BodyPartCodes({id:13,code:"codes-back"}), new BodyPartCodes({id:1013,code:"codes-back"})],
    }),
    new BodyPart({
        "id": 14,
        "name": "extremities",
        "type": "physicalExamination",
        // "codes":[new BodyPartCodes({id:14,code:"codes-extremities"}), new BodyPartCodes({id:1014,code:"codes-extremities"})],
    }),
    new BodyPart({
        "id": 15,
        "name": "cerbical spine",
        "type": "physicalExm2",
        "bodyPartKey": "cervical-spine",
        // "codes":[new BodyPartCodes({id:15,code:"codes-physicalExm2"}), new BodyPartCodes({id:1015,code:"codes-physicalExm2"})],
    }),
    new BodyPart({
        "id": 16,
        "name": "lumbosacral spine:",
        "type": "physicalExm2",
        "bodyPartKey": "lumbosacral-spine",
        // "codes":[new BodyPartCodes({id:16,code:"codes-physicalExm2"}), new BodyPartCodes({id:1016,code:"codes-physicalExm2"})],
    }),
    new BodyPart({
        "id": 17,
        "name": "elbow",
        "type": "physicalExm2",
        "bodyPartKey": "elbow",
        // "codes":[new BodyPartCodes({id:17,code:"codes-physicalExm2"})],
    }),
    new BodyPart({
        "id": 18,
        "name": "wrist",
        "type": "physicalExm2",
        "bodyPartKey": "wrist",
        // "codes":[new BodyPartCodes({id:18,code:"codes-physicalExm2"})],
    }),
    new BodyPart({
        "id": 19,
        "name": "shoulder",
        "type": "physicalExm2",
        "bodyPartKey": "shoulder",
        // "codes":[new BodyPartCodes({id:19,code:"codes-physicalExm2"})],
    }),
    new BodyPart({
        "id": 20,
        "name": "hip",
        "type": "physicalExm2",
        "bodyPartKey": "hip",
        // "codes":[new BodyPartCodes({id:20,code:"codes-physicalExm2"})],
    }),
    new BodyPart({
        "id": 21,
        "name": "knee",
        "type": "physicalExm2",
        "bodyPartKey": "knee",
        // "codes":[new BodyPartCodes({id:21,code:"codes-physicalExm2"})],
    }),
    new BodyPart({
        "id": 22,
        "name": "ankle",
        "type": "physicalExm2",
        "bodyPartKey": "ankle",
        // "codes":[new BodyPartCodes({id:22,code:"codes-physicalExm2"})],
    }),
    new BodyPart({
        "id": 23,
        "name": "thoracic spine:",
        "type": "physicalExm2",
        "bodyPartKey": "thoracic-spine",
    }),
    new BodyPart({
        "id": 24,
        "name": "neck:",
        "type": "diagnosticImpression",
        "bodyPartKey": "neck",
        "codes": [
            new BodyPartCodes(
                {
                    id: 1,
                    code: "neck-2556"
                }
            ),
            new BodyPartCodes(
                {
                    id: 2,
                    code: "neck-2212"
                }
            ),
            new BodyPartCodes(
                {
                    id: 3,
                    code: "neck-1592"
                }
            ),],
    }),
    new BodyPart({
        "id": 25,
        "name": "shoulder",
        "type": "diagnosticImpression",
        "bodyPartKey": "shoulder",
        "codes": [
            new BodyPartCodes(
                {
                    id: 11,
                    code: "shoulder-5256"
                }
            ),
            new BodyPartCodes(
                {
                    id: 12,
                    code: "shoulder-5312"
                }
            ),
            new BodyPartCodes(
                {
                    id: 13,
                    code: "shoulder-5252"
                }
            ),],
    }),
];

export const FEELINGS: Feelings[] = [
    new Feelings({
        id: 1,
        name: "Sharp"
    }),
    new Feelings(
        {
            id: 2,
            name: "Stabbing"
        }),
    new Feelings(
        {
            id: 3,
            name: "Dull"
        }),
    new Feelings(
        {
            id: 4,
            name: "Burning"
        }),
    new Feelings(
        {
            id: 5,
            name: "Achy"
        }),
    new Feelings(
        {
            id: 6,
            name: "Shooting"
        })
];

// export const SENSATIONS: Sensation[] = [
//     new Sensation({
//         id: 1,
//         name: "Tingling",
//     }),
//     new Sensation({
//         id: 2,
//         name: "Numbness"
//     })

// ];

// export const RADIATION: Radiation[] = [
//     new Radiation({
//         bodyPartId: 1, //Neck
//         position: "shoulder",
//         location: ""
//     }),
//     new Radiation({
//         bodyPartId: 1,//Neck
//         position: "upper extremity",
//         location: ""
//     }),
//     new Radiation({
//         bodyPartId: 3, //Shoulder
//         position: "buttock",
//         location: ""
//     }),
//     new Radiation({
//         bodyPartId: 3,//Shoulder
//         position: "lower extremity",
//         location: ""
//     }),
//     new Radiation({
//         bodyPartId: 2,//Back
//         position: "upper extremity",
//         location: ""
//     }),
//     new Radiation({
//         bodyPartId: 4,//Hip
//         position: "lower extremity",
//         location: ""
//     }),
//     new Radiation({
//         bodyPartId: 5,//Knee
//         position: "lower extremity",
//         location: ""
//     })
// ];

// export const SUBBODYPARTS: SubBodyPart[] = [
//     new SubBodyPart(
//         {
//             "id": 1,
//             "name": "left arm",
//             "bodyPartId": 6
//         }
//     ),
//     new SubBodyPart(
//         {
//             "id": 2,
//             "name": "right arm",
//             "bodyPartId": 6
//         }),
//     new SubBodyPart(
//         {
//             "id": 3,
//             "name": "right elbow",
//             "bodyPartId": 6
//         }),
//     new SubBodyPart(
//         {
//             "id": 4,
//             "name": "left elbow",
//             "bodyPartId": 6
//         }),
//     new SubBodyPart(
//         {
//             "id": 5,
//             "name": "right forearm",
//             "bodyPartId": 6
//         }),
//     new SubBodyPart(
//         {
//             "id": 6,
//             "name": "left forearm",
//             "bodyPartId": 6
//         }),
//     new SubBodyPart(
//         {
//             "id": 7,
//             "name": "right wrist",
//             "bodyPartId": 6
//         }),
//     new SubBodyPart(
//         {
//             "id": 8,
//             "name": "left wrist",
//             "bodyPartId": 6
//         }),
//     new SubBodyPart(
//         {
//             "id": 9,
//             "name": "right hand",
//             "bodyPartId": 6
//         }),
//     new SubBodyPart(
//         {
//             "id": 10,
//             "name": "left hand",
//             "bodyPartId": 6
//         }),
//     new SubBodyPart(
//         {
//             "id": 11,
//             "name": "right leg",
//             "bodyPartId": 7
//         }),
//     new SubBodyPart(
//         {
//             "id": 12,
//             "name": "left leg",
//             "bodyPartId": 7
//         }),
//     new SubBodyPart(
//         {
//             "id": 13,
//             "name": "right ankle",
//             "bodyPartId": 7
//         }),
//     new SubBodyPart(
//         {
//             "id": 14,
//             "name": "left ankle",
//             "bodyPartId": 7
//         }),
//     new SubBodyPart(
//         {
//             "id": 15,
//             "name": "right foot",
//             "bodyPartId": 7
//         }),
//     new SubBodyPart(
//         {
//             "id": 16,
//             "name": "left foot",
//             "bodyPartId": 7
//         })
// ];

export const REASONS: PainExacerbationReasons[] = [
    new PainExacerbationReasons({
        "id": 1,
        "name": "going up/down stairs",
    }
    ),
    new PainExacerbationReasons({
        "id": 2,
        "name": "bending down",
    }
    ),
    new PainExacerbationReasons({
        "id": 3,
        "name": "squatting",
    }
    ),
    new PainExacerbationReasons({
        "id": 4,
        "name": "pushing",
    }
    ),
    new PainExacerbationReasons({
        "id": 5,
        "name": "lifting",
    }
    ),
    new PainExacerbationReasons({
        "id": 6,
        "name": "pulling",
    }
    ),
    new PainExacerbationReasons({
        "id": 7,
        "name": "prolonged walking",
    }
    ),
    new PainExacerbationReasons({
        "id": 8,
        "name": "prolonged standing",
    }
    ),
    new PainExacerbationReasons({
        "id": 9,
        "name": "lying down",
    }
    ),
    new PainExacerbationReasons({
        "id": 10,
        "name": "deep breathing",
    }
    ),
    new PainExacerbationReasons({
        "id": 11,
        "name": "carrying heavy objects",
    }
    ),
    new PainExacerbationReasons({
        "id": 12,
        "name": "prolonged sitting",
    }
    ),
    new PainExacerbationReasons({
        "id": 13,
        "name": "weather change",
    }
    ),
    new PainExacerbationReasons({
        "id": 14,
        "name": "standing up from a sitting position",
    }
    )
];

export const DUMMYRESPONSE = {
    "status": true,
    "message": "Medical session saved successfully.",
    "data": {
        "id": "2",
        // "parentId":"1",//or null,
        "caseId": 1,
        "doctorId": 1,
        "patientId": 1,
        "evaluation": {
            "chiefComplaints": "Qaiser Chief Complaints",
            "illnessHistory": "Qaiser illness History",
            "comments": "Doctor comments here",
        },
        "Complaints": [
            {
                "painScale": "6",
                "painStyle": "constant",
                "comments": "This is comment about complaint1",
                "bodyPartId": "1",
                "complaintId": 7,
                "id": 12,
                "sensations": [
                    {
                        "bodyPartSensationId": "1",
                        "currentComplaintId": 12,
                        "id": 23
                    },
                    {
                        "bodyPartSensationId": "2",
                        "currentComplaintId": 12,
                        "id": 24
                    }
                ],
                "feelings": [
                    {
                        "bodyPartId": "1",
                        "currentComplaintId": 12,
                        "feeling": "Test Feeling 1",
                        "id": 23
                    },
                    {
                        "bodyPartId": "1",
                        "currentComplaintId": 12,
                        "feeling": "Test Feeling 2",
                        "id": 24
                    }
                ],
                "radiations": [
                    {
                        "bodyPartId": "1",
                        "currentComplaintId": 12,
                        "location": "Test Feeling 1",
                        "position": "Test Feeling 1",
                        "id": 23
                    },
                    {
                        "bodyPartId": "1",
                        "currentComplaintId": 12,
                        "location": "Test Feeling 2",
                        "position": "Test Feeling 2",
                        "id": 24
                    }
                ]
            }
        ]
    }
}


//************************************************
//**************Physical Examination**************
//************************************************

export const BODYPARTCONDITIONS: BodyPartCondition[] = [

    new BodyPartCondition({
        "id": 1,
        "condition": "Normocephalic",
        "bodyPartId": 8
    }),
    new BodyPartCondition({
        "id": 2,
        "condition": "Atraumatic",
        "bodyPartId": 8
    }),
    new BodyPartCondition({
        "id": 3,
        "condition": "Pupils are equally round and reactive to light and accommodation",
        "bodyPartId": 9
    }),
    new BodyPartCondition({
        "id": 4,
        "condition": "Extraocular Muscles are intact",
        "bodyPartId": 9
    }),
    new BodyPartCondition({
        "id": 5,
        "condition": "There are no deformities and",
        "bodyPartId": 10,
        "conditionStates": [
            new ConditionStates({
                id: 1,
                state: "negative tenderness to palpation",
                bodyPartConditionId: 5
            }),
            new ConditionStates({
                id: 2,
                state: "positive tenderness to palpation",
                bodyPartConditionId: 5
            })]
    }),
    new BodyPartCondition({
        "id": 6,
        "condition": "Regular rate & rythm",
        "bodyPartId": 11
    }),
    new BodyPartCondition({
        "id": 7,
        "condition": "Normal S1 & S2",
        "bodyPartId": 11
    }),
    new BodyPartCondition({
        "id": 8,
        "condition": "Soft and nontender with normoactive bowel sounds present",
        "bodyPartId": 12
    })
];

export const DEVICES: Devices[] = [
    new Devices({
        id: 1,
        name: "Ankle Brace",
        location: true,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 2,
        name: "Cane",
        location: false,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 3,
        name: "Cam Both",
        location: false,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 4,
        name: "Cervical traction",
        location: false,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 5,
        name: "Cold therapy unit",
        location: false,
        lengths_of_need: [14, 21, 28],
        usage: ['use_in_control_unit', 'frequency', 'pressure', 'time'],
        bodyParts: null
    }),
    new Devices({
        id: 6,
        name: "Cervical pillow",
        location: false,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 7,
        name: "Elbow Brace",
        location: true,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 8,
        name: "Ergonomic pillow",
        location: false,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 9,
        name: "Knee brace",
        location: true,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 10,
        name: "LSO",
        location: false,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 11,
        name: "Lumbar Cushion",
        location: false,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 12,
        name: "Massager",
        location: false,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 13,
        name: "Shoulder sling",
        location: true,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 14,
        name: "Tens Unit",
        location: false,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 15,
        name: "TLSO",
        location: false,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 16,
        name: "Wrist brace",
        location: true,
        lengths_of_need: null,
        usage: null,
        bodyParts: null
    }),
    new Devices({
        id: 17,
        name: "Ultrasound unit",
        location: false,
        lengths_of_need: [28, 42, 56],
        usage: ['use_in_control_unit', 'frequency', 'pressure', 'time'],
        bodyParts: [
            {
                "id": 23,
                "name": "Neck",
                'hasLocation': true,
            },
            {
                "id": 24,
                "name": "Shoulder",
                'hasLocation': true,
            }
        ]
    })
];
