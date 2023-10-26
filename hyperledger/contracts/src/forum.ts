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
import { Case } from './types/case.d';


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
            caseId?: number;
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

    // Function to create case document
    public async CreateCaseDoc(
        { stub }: { stub: ChaincodeStub },
        key: string,
        cid: string,
        owner: string,
        extention: string,
        fileName: string
    ): Promise<void> {
        return await this.eVault.CreateDoc(
            { stub },
            key,
            cid,
            owner,
            extention,
            fileName
        );
    }

    // Function to update case document
    public async UpdateCaseDoc(
        { stub }: { stub: ChaincodeStub },
        key: string,
        {
            cid,
            owner,
            extention,
            fileName,
        }: {
            cid?: string;
            owner?: string;
            extention?: string;
            fileName?: string;
        }
    ): Promise<void> {
        return await this.eVault.UpdateDoc({ stub }, key, {
            cid,
            owner,
            extention,
            fileName,
        });
    }

    // Function to get a specific case document
    public async GetCaseDoc(
        { stub }: { stub: ChaincodeStub },
        key: string
    ): Promise<Document | null> {
        return await this.eVault.GetDoc({ stub }, key);
    }

    // Function to delete a specific case document
    public async DeleteCaseDoc(
        { stub }: { stub: ChaincodeStub },
        key: string
    ): Promise<void> {
        return await this.eVault.DeleteDoc({ stub }, key);
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

