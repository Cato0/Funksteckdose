import { ITransferTransaction } from "@waves/waves-transactions/dist/transactions";

export interface TransactionModel {
    _customerAddress: string 
    _customerPublicKey: string
    _multiSignatureAddress: string
    _multiSignaturePublicKey: string
    _multiSignatureSeed: string
    _socketId: string
    _socketEnergy: string
    _token: string
    _energyToToken: string
    _initialTransactionIdFromCustomer: string
    _setupTransactionId: string
    _setScriptTransactionId: string
    _backupTransaction: string
};