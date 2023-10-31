/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { eVaultContract } from './eVault';
import { ChaincodeStub } from 'fabric-shim';
import {
    Context,
    Contract,
    Info,
    Returns,
    Transaction,
} from 'fabric-contract-api';
import { Document } from './types/document';
import { Case, CaseType, ClientType, Client } from './types/case.d';

@Info({
    title: 'forum',
    description: 'Smart contract for case document management',
})
export class caseContract extends Contract {
    private eVault: eVaultContract;

    constructor() {
        super('Case');
        this.eVault = new eVaultContract();
    }

    @Transaction(false)
    public async InitLedger(ctx: Context): Promise<void> {
        console.log('InitLedger Called');
    }

    // Function to get all documents of case and lawyers
    @Transaction(false)
    public async GetAllDocs(
        { stub }: { stub: ChaincodeStub },
        {
            caseId,
            lawyers,
        }: {
            caseId: number;
            lawyers?: string;
        }
    ): Promise<Case[]> {
        const selector: any = {};

        if (caseId !== undefined) {
            selector.caseId = caseId;
        } else {
            throw new Error('caseId is required');
        }

        if (lawyers !== undefined) {
            selector.lawyers = lawyers;
        }

        const queryString = {
            selector: selector,
        };

        const queryResults = await stub.getQueryResultWithPagination(
            JSON.stringify(queryString),
            20
        );
        return await this.GetAllResults(queryResults);
    }

    //create case id function

    @Transaction()
    public async CreateCase(
        { stub }: { stub: ChaincodeStub },
        caseId: string,
        caseType: CaseType,
        clientType: ClientType,
        username: string,
        org: string,
        lawyer: string
    ): Promise<void> {
        const caseKey = `CASE_${caseId}`;

        const clientData: Client = { username, org, lawyer };

        const clientObj =
            clientType === ClientType.PETITIONER
                ? {
                      petitioner: clientData,
                      respondent: { username: '', org: '', lawyer: '' },
                  }
                : {
                      respondent: clientData,
                      petitioner: { username: '', org: '', lawyer: '' },
                  };

        const newCase: Case = {
            caseId,
            caseType,
            judge: '', // Consider providing a way to set this
            docs: [], // Assuming no documents are added during case creation
            client: clientObj,
        };
        stub.putState(caseKey, Buffer.from(JSON.stringify(newCase)));
    }

    // update case function

    @Transaction()
    public async UpdateCase(
        { stub }: { stub: ChaincodeStub },
        caseId: string,
        {
            caseType,
            judge,
            clientType,
            username,
            org,
            lawyer,
        }: {
            caseType?: CaseType;
            judge?: string;
            clientType?: ClientType;
            username?: string;
            org?: string;
            lawyer?: string;
        }
    ): Promise<void> {
        const caseKey = `CASE_${caseId}`;
        const caseDataBuffer = await stub.getState(caseKey);
        if (!caseDataBuffer || caseDataBuffer.length === 0) {
            throw new Error(`Case with ID: ${caseId} does not exist.`);
        }

        const existingCase: Case = JSON.parse(caseDataBuffer.toString());

        existingCase.caseType = caseType || existingCase.caseType;
        existingCase.judge = judge || existingCase.judge;

        if (clientType && (username || org || lawyer)) {
            const clientData: Client = {
                username: username || '',
                org: org || '',
                lawyer: lawyer || '',
            };
            if (clientType === ClientType.PETITIONER) {
                existingCase.client.petitioner = clientData;
            } else {
                existingCase.client.respondent = clientData;
            }
        }

        await stub.putState(caseKey, Buffer.from(JSON.stringify(existingCase)));
    }

    // delete case
    @Transaction()
    public async DeleteCase(
        { stub }: { stub: ChaincodeStub },
        caseId: string
    ): Promise<void> {
        const caseKey = `CASE_${caseId}`;
        const caseDataBuffer = await stub.getState(caseKey);

        if (!caseDataBuffer || caseDataBuffer.length === 0) {
            throw new Error(`Case with ID: ${caseId} does not exist.`);
        }

        await stub.deleteState(caseKey);
    }

    @Transaction(false)
    async GetAllResults(promiseOfIterator) {
        const allResults = [];
        for await (const res of promiseOfIterator) {
            allResults.push(JSON.parse(res?.value?.toString()));
        }
        return allResults;
    }
}

