export enum CaseType {
    WC = "WC",
    NF = "NF",
    Private = "Private",
    Self = "Self",
    Lien = "Lien",
    Corporate = "Corporate",
    NoFault = "NoFault/Workers Comp",
    WCEmployer = "WC(Employer)"
}
export function CaseTypeBgConfig(caseTypeCode: any) {
    return [{
        casetype: CaseType.WC,
        bgColor: '#F4A74D',
        order:0

    },
    {
        casetype: CaseType.NF,
        bgColor: '#2FA3AE',
        order:1

    },
    {
        casetype: CaseType.Private,
        bgColor: '#56A5F1',
        order:4

    },
    {
        casetype: CaseType.Self,
        bgColor: '#FEE5C9',
        order:2

    },
    {
        casetype: CaseType.Lien,
        bgColor: '#A0AEEA',
        order:3

    },
    {
        casetype: CaseType.Corporate,
        bgColor: '#A1E3F7',
        order:5

    },
    {
        casetype: CaseType.NoFault,
        bgColor: '#107F7B',
        order:7

    },
    {
        casetype: CaseType.WCEmployer,
        bgColor: '#CAD4FD',
        order:6

    },

    ].find(type => type.casetype == caseTypeCode);

}