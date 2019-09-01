import { Injectable } from "@angular/core";
import { catchError, tap, retry } from 'rxjs/operators';
import { Socket, SocketStatus } from "../definitions/socket";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { HttpErrorHandler, HandleError } from "../errors/http-error-handler.service";
import { Address } from "../definitions/address";
import { Script } from "../definitions/script";
import { TransactionModel } from "../definitions/addTransaction";
import { Asset } from "../definitions/asset";

const httpOptions = {
    headers: new HttpHeaders({        
        "Content-Type": "application/json",
        // "Access-Control-Allow-Origin": "*"
    })
};

@Injectable()
export class SocketService {
    private handleError: HandleError;
    private socketServiceURL: string = 'http://127.0.0.1:5000/';
    private devSocketURL: string = 'assets/messages/';
    
    constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
        this.handleError = httpErrorHandler.createHandleError('SocketService');
    }

    getSocket(id: string): Observable<any> {
        return this.http
            .get<any>(this.socketServiceURL + 'selectSocket/' + id)
            .pipe(
                retry(3),
                tap(_ => console.log('fetched socket with id=' + id)),
                catchError(this.handleError('selectSocket(' + id + ')', {}))
            );
    }
    
    getSocketStatus(id: string): Observable<SocketStatus> {
        return this.http
            .get<SocketStatus>(this.socketServiceURL + 'getSocketStatus/' + id)
            .pipe(
                retry(3),
                tap(_ => console.log('fetched socket status with id=' + id)),
                catchError(this.handleError('getSocketStatus(' + id + ')', SocketStatus.UNAVAILABLE))
            );
    }

    getSockets(): Observable<Socket[]> {
        return this.http
            .get<Socket[]>(this.socketServiceURL + 'getSocketsStatus/')
            .pipe(
                retry(3),
                tap(_ => console.log('fetched sockets')),
                catchError(this.handleError('getSocketsStatus', []))
            );
    }

    getSocketLoad(id: string): Observable<SocketStatus> {
        return this.http
            .get<SocketStatus>(this.socketServiceURL + 'getSocketLoad/' + id)
            .pipe(
                retry(3),
                tap(_ => console.log('fetched socket status with id=' + id)),
                catchError(this.handleError('getSocketStatus(' + id + ')', SocketStatus.UNAVAILABLE))
            );
    }

    getTrader(): Observable<Address> {
        return this.http
            .get<Address>(this.devSocketURL + 'getTrader.json')
            .pipe(
                retry(3),
                tap(_ => console.log('fetched trader')),
                catchError(this.handleError('getTrader', {}))
            );
    }

    getAsset(): Observable<Asset> {
        return this.http
            .get<Asset>(this.socketServiceURL + 'getAsset/')
            .pipe(
                retry(3),
                tap(_ => console.log('fetched asset')),
                catchError(this.handleError('getAsset', {}))
            );
    }

    setInitialDatabaseRecord(transaction: TransactionModel): Observable<any> {
        return this.http
            .post(this.socketServiceURL + 'addTransaction/', transaction)
            .pipe(
                catchError(this.handleError('setInitialDatabaseRecord', -1))
            );
    }

    compileScript(script: string): Observable<Script> {
        return this.http
            .post<Script>('https://testnodes.wavesnodes.com/utils/script/compile', script)
            .pipe(
                catchError(this.handleError('compileScript', {}))
            );
    }

    checkTransaction(txId: string): Observable<any> {
        return this.http
            .get('https://testnodes.wavesnodes.com/transactions/info/' + txId)
            .pipe(
                catchError(this.handleError('checkTransaction', false))
            );
    }

    startLoadingProcess(recId: string): Observable<any> {
        return this.http
            .get(this.socketServiceURL + 'startLoadingProcess/' + recId)
            .pipe(
                catchError(this.handleError('startLoadingProcess', false))
            );
    }

    stopLoadingProcess(recId: string): Observable<any> {
        return this.http
            .get(this.socketServiceURL + 'stopLoadingProcess/' + recId)
            .pipe(
                catchError(this.handleError('stopLoadingProcess', false))
            );
    }

    saveCompleteTransactionId(recId: string, transactionId: string): Observable<any> {
        return this.http
            .get(this.socketServiceURL + 'saveCompleteTransaction/' + recId + '/' + transactionId)
            .pipe(
                catchError(this.handleError('saveCompleteTransaction', false))
            );
    }
}
