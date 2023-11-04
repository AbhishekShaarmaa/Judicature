/*
  SPDX-License-Identifier: Apache-2.0
*/

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Client {
    @Property()
    public username: string;

    @Property()
    public org: string;

    @Property()
    public caseType: CaseType;

    @Property()
    public lawyer?: string;
}

@Object()
export class Document {
    @Property()
    public addedBy: string;

    @Property()
    public docKey: string;
}

export enum CaseType {
    labour = 'LABOUR',
    rentAct = 'RENT_ACT',
    directTaxes = 'DIRECT_TAXES',
    indirectTaxes = 'INDIRECT TAXES',
    landAcquisitionAndRequisition = 'LAND_ACQUISITION_REQUISITION',
    service = 'SERVICE',
    academic = 'ACADEMIC',
    letterPetitionAndPIL = 'LETTER_PETITION_PIL',
    election = 'ELECTION',
    arbitration = 'ARBITRATION',
    compensation = 'COMPENSATION',
}

export enum ClientType {
    RESPONDENT = 'respondent',
    PETITIONER = 'petitioner',
}

// client[clientType].username =

@Object()
export class Case {
    @Property()
    public caseType: CaseType;

    @Property()
    public caseId: string;

    @Property()
    public judge: string;

    @Property()
    public docs: Document[];

    @Property()
    public petitioner: string;

    @Property()
    public respondent: string;
}
