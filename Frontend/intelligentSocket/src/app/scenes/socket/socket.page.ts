import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket, SocketStatus } from '../../definitions/socket';
import { Address } from 'src/app/definitions/address';
import { transfer, seedUtils, setScript, broadcast, massTransfer } from '@waves/waves-transactions';
import { Script } from 'src/app/definitions/script';
import { ITransferTransaction, IMassTransferTransaction } from '@waves/waves-transactions/dist/transactions';
import { Asset } from 'src/app/definitions/asset';
const wc = require('@waves/waves-crypto');

const apiBase = 'https://testnode1.wavesnodes.com';
const scriptTemplate = "let energyToToken = :energyToToken * 1000;"
                     + "let customerPubKey = base58':customerKey';"
                     + "let traderPubKey = base58':traderKey';"
                     + "let customerSigned = if(sigVerify(tx.bodyBytes, tx.proofs[0], customerPubKey) || sigVerify(tx.bodyBytes, tx.proofs[1], customerPubKey)) then 1 else 0;"
                     + "let traderSigned = if(sigVerify(tx.bodyBytes, tx.proofs[1], traderPubKey) || sigVerify(tx.bodyBytes, tx.proofs[0], traderPubKey)) then 1 else 0;"
                     + "customerSigned + traderSigned >= 2";

@Component({
  selector: 'socket',
  templateUrl: 'socket.page.html',
  providers: [ SocketService, AlertController ],
  styleUrls: ['socket.page.scss']
})
export class SocketPage implements OnInit {

    intervalId = 3;
    progressValue = 0;

    socket: Socket;

    asset: Asset;
    token: number;

    customer: Address;
    multiSignatureAccount: Address;
    trader: Address;
    
    compiledScript: Script;
    backupTransferTransaction: ITransferTransaction

    recId: string;
    
    loadingReady: boolean = false;
    loadingStarted: boolean = false;

    started: boolean = false;

    processId: string;

    massTransferTransaction: IMassTransferTransaction;

    constructor(public socketService: SocketService, 
              public alertCtrl: AlertController,
              private route: ActivatedRoute,
              private router: Router) {}

    ngOnInit() {
        this.customer = {
            // Defaults fürs testen
            address: '3Ms6dTRi6C5ZRMwYyiqN4DPwrceyobg5Szm',
            publicKey: 'KcQuAzZw15FsKMLAVtr7Z1bQ1rhbntCwgZsCsr6npGT'
        };
        // TODO: Trader infos und assetId aus backend ziehen
        this.socketService.getTrader().subscribe(trader => {
            this.trader = trader;
        })
        this.socketService.getAsset().subscribe(asset => {
            this.asset = asset;
        });        

        const id = this.route.snapshot.paramMap.get('id')
        this.socketService.getSocket(id).subscribe(socket => {
            this.socket = {
                id: socket.Socket_Id,
                manufacturer: socket.Manufacturer,
                plugId: socket.Plug_Id,
                ip: socket.Ip_Address,
                energy: 10
            };

            this.socketService.getSocketStatus(id).subscribe(status => {
                this.socket.status = status;

                // for developing purpose
                // this.socket.status = SocketStatus.CHARGING;
                if (this.socket.status === SocketStatus.CHARGING) {

                    console.log('Socket already in use.');
                    this.loadingStarted = true;
                        console.log(localStorage);
                        if (localStorage.getItem('recId')) {
                        this.recId = localStorage.getItem('recId');                    
                        } else {
                        console.log('Nicht alle notwendigen Infos stehen im localStorage');
                        }
                        // TODO: Contact database to get needed information: recId
                        // TODO: in stopLoadingProcess also get all further needed infos from response.
                }
            }, error => {
                console.error(error);
            });

            
        });
    }

    updateProgressBar(scope, socketId) {

        if (scope.progressValue < 100) {

            this.socketService.getSocketLoad(socketId).subscribe(data => {
                console.log(data);
                scope.progressValue = data;
            });
        }
        else {
            //window.clearInterval(scope.intervalId);
			this.stopLoadingProcess()
        }
    }

    startProgressBarUpdater (socketId) {

        this.intervalId = window.setInterval(  () => { this.updateProgressBar(this, socketId); }, 10000); // 10 sek.
    }

    async useManual() {
        if (!this.customer.address && !this.customer.publicKey) {
            console.log('no address and public key was entered');
        } else {                   
            const alert = await this.alertCtrl.create({
                header: 'Bestätigen',
                message: 'Sind Sie sicher, dass Sie den Vorgang fortsetzen möchten?\n' + 'Menge: ' + this.socket.energy / 1000 + ' Token',
                buttons: ['Abbrechen', {
                    text: 'Bestätigen',
                    handler: () => {
                        
                        localStorage.setItem('customerAddress', this.customer.address.toString());
                        localStorage.setItem('customerPublicKey', this.customer.publicKey.toString());
                        localStorage.setItem('socketId', this.socket.id.toString());
                        localStorage.setItem('energy', this.socket.energy.toString());

                        // Create MultiSigAcc
                        this.createAccount();

                        this.token = this.socket.energy * this.asset.exchangeRate;
                        // Customer pays Token onto MultiSigAccount
                        let customURL = 'https://testnet.wavesplatform.com/#send/';
                        customURL += this.asset.token;
                        customURL += '&recipient=' + this.multiSignatureAccount.address;
                        customURL += '&amount=' + (this.token).toString();
                        customURL += '&referer=' + 'https://localhost:8100/firstStepSuccess';
                        customURL += '&strict';
                        console.log(customURL);
                        
                        this.router.navigate(['/externalRedirect', { externalUrl: customURL }]);
                    }
                }]
            })
            await alert.present();
        }
    }

    createAccount() {
        this.multiSignatureAccount = {}
        this.multiSignatureAccount.seed = seedUtils.generateNewSeed(15);
        this.multiSignatureAccount.address = wc.address(this.multiSignatureAccount.seed, 'T');
        const keyPair = wc.keyPair(this.multiSignatureAccount.seed);
        this.multiSignatureAccount.publicKey = keyPair.public;
        
        localStorage.setItem('multiSignatureAddress', this.multiSignatureAccount.address.toString());
        localStorage.setItem('multiSignatureSeed', this.multiSignatureAccount.seed.toString());
        localStorage.setItem('multiSignaturePublicKey', this.multiSignatureAccount.publicKey.toString());
    }

    useWavesKeeper() {
        if (this.socket.energy) {
            const authData = { data: "Auth on my site" };
            Waves.auth(authData).then(auth => {
                this.token = this.socket.energy * this.asset.exchangeRate;
                localStorage.setItem('customerAddress', auth.address.toString());
                localStorage.setItem('customerPublicKey', auth.publicKey.toString());
                localStorage.setItem('socketId', this.socket.id.toString());
                localStorage.setItem('energy', this.socket.energy.toString());
                localStorage.setItem('energyToToken', this.asset.exchangeRate.toString());
                localStorage.setItem('token', this.token.toString());

                this.customer.address = auth.address;
                this.customer.publicKey = auth.publicKey;

                this.createAccount();

                Waves.signAndPublishTransaction({
                    type: 4,
                    data: {
                        amount: {
                            assetId: this.asset.token,
                            tokens: (this.token).toString()
                        },
                        fee: {
                            assetId: 'WAVES',
                            tokens: 0.001
                        },
                        recipient: this.multiSignatureAccount.address
                    }
                }).then(data => {
                    this.started = true;
                    const tx = JSON.parse(data);
                    localStorage.setItem('initialTransactionFromCustomer', tx.id);
                    if (tx && tx.proofs && tx.proofs.length >= 1) {
                        this.buildScript();
                    } else {
                        console.log('transaction was not successful');
                    }
                }).catch(error => {
                    console.error(error);
                });
            }).catch(error => {
                console.error(error);
            })
        }
    }

    buildScript() {
        let replacedScript = scriptTemplate.replace(':customerKey', this.customer.publicKey);
        replacedScript = replacedScript.replace(':traderKey', this.trader.publicKey);
        replacedScript = replacedScript.replace(':energyToToken', (this.asset.exchangeRate * 1000).toString());

        this.socketService.compileScript(replacedScript).subscribe(script => {
            this.compiledScript = script;        
            this.attachScript();
        });
    }

    attachScript() {
        // Before attaching Script to multiSignatureAccount, transfer some Waves from Trader to MultiSigAccount for necessary transaction-fees
        // Transfer 0.01 Waves onto the MultiSigAccount from trader for setScriptTransaction.
        // Transfer 0.007 Waves onto the MultiSigAccount from trader for massTransferTransaction.
        const signedSetupTx = transfer({
            amount: 0.017 * Math.pow(10, 8),
            recipient: this.multiSignatureAccount.address
        }, this.trader.seed);
        localStorage.setItem('setupTransaction', signedSetupTx.id);
        broadcast(signedSetupTx, apiBase).then((response) => {
            if (response && response.proofs && response.proofs.length >= 1 && response.type == 4) {
                const setScriptTransaction = setScript({ 
                    script: this.compiledScript.script,
                    senderPublicKey: this.multiSignatureAccount.publicKey,
                    chainId: 'T'
                }, this.multiSignatureAccount.seed);

                localStorage.setItem('setScriptTransaction', setScriptTransaction.id);
                // Wait 10 seconds, before transaction gets broadcasted.
                // Wenn der Ablauf zu schnell ist, dann kann es sein, dass die Transaktionen zuvor noch nicht bestätigt sind. 
                // Dann ist nicht genug Guthaben auf dem Multi-Account und die Transaktion würde scheitern.
                setTimeout(() => {
                    broadcast(setScriptTransaction, apiBase).then((response) => {
                        if (response && response.proofs && response.proofs.length >= 1 
                            && response.script == this.compiledScript.script && response.type == 13) {
                            this.createBackup();
                        } else {
                            console.log('Error in setScriptTransaction-broadcast.')
                        }
                    }).catch(error => {
                        console.log(error);
                    });
                }, 10000);
            } else {
                console.error('Transfer-Transaction was not successful');
            }
        });
    }

    createBackup() {   
        Waves.signTransaction({
            type: 4,
            data: {
                amount: {
                    assetId: this.asset.token,
                    tokens: (this.token).toString()
                },
                fee: {
                    assetId: 'WAVES',
                    tokens: "0.001"
                },
                recipient: this.trader.address
            }
        }).then((res) => {
            // BackupTransferTransaction is signed by Customer
            // Now contact backend with all necessary information. It should create a record in transaction-table and return the record-id
            let data = {
                _customerAddress: this.customer.address.toString(), 
                _customerPublicKey: this.customer.publicKey.toString(), 
                _multiSignatureAddress: this.multiSignatureAccount.address.toString(), 
                _multiSignaturePublicKey: this.multiSignatureAccount.publicKey.toString(), 
                _multiSignatureSeed: this.multiSignatureAccount.seed.toString(),
                _socketId: this.socket.id.toString(),
                _socketEnergy: this.socket.energy.toString(),
                _token: this.token.toString(),
                _energyToToken: this.asset.exchangeRate.toString(),
                _initialTransactionIdFromCustomer: localStorage.getItem('initialTransactionFromCustomer').toString(),
                _setupTransactionId: localStorage.getItem('setupTransaction').toString(),
                _setScriptTransactionId: localStorage.getItem('setScriptTransaction').toString(),
                _backupTransaction: res
            };

            this.socketService.setInitialDatabaseRecord(data).subscribe(response => {
                this.recId = response.recId;
                // this.recId = '123';
                localStorage.setItem('recId', this.recId);
                this.loadingReady = true;
                
                this.show();
            }, error => {
                console.error(error);
            });          
        }).catch(error => {
            console.error(error);
        })
    }

    async show() {
        const alert = await this.alertCtrl.create({
            header: 'Bestätigen',
            message: 'Sie können nun den Ladevorgang starten',
            buttons: ['Bestätigen']
        })
        await alert.present();
    }

    startLoadingProcess() {
        this.socketService.startLoadingProcess(this.recId).subscribe((response) => {
            this.loadingStarted = true;
            this.socket.status = SocketStatus.CHARGING;

            this.startProgressBarUpdater( this.socket.id );

        }, (error) => {
            console.error(error);
        });
    }
    
    stopLoadingProcess() {
        
        window.clearInterval(this.intervalId);

        this.recId = localStorage.getItem('recId');    
        this.socketService.stopLoadingProcess(this.recId).subscribe((response) => {
            console.log('Charging process stopped.');
            this.loadingStarted = false;
            this.socket.status = SocketStatus.CHARGING_FINISHED;
            this.backupTransferTransaction = JSON.parse(response.backupTransaction);
            this.customer.address = response.customerAddress;
            this.multiSignatureAccount.publicKey = response.multiSignaturePublicKey;
            this.completeProcess(response.tokensForCustomer, response.tokensForTrader);
        });
    }
    
    completeProcess(tokensForCustomer: number, tokensForTrader: number) {
        if (tokensForCustomer <= 0) {
            broadcast(this.backupTransferTransaction, apiBase).then((data) => {
                this.saveCompleteTransaction(data.id);
            }).catch(error => {
                console.error(error);
            });
        } else {
            Waves.signTransaction({
                type: 11,
                data: {
                    totalAmount: {
                        assetId: this.asset.token,
                        coins: 0
                    },
                    transfers: [{
                        recipient: this.customer.address,
                        amount: tokensForCustomer * 1000
                    }, {
                        recipient: this.trader.address,
                        amount: tokensForTrader * 1000
                    }],
                    fee: {
                        tokens: 0.006,
                        assetId: 'WAVES'
                    },
                    senderPublicKey: this.multiSignatureAccount.publicKey
                }
            }).then((data) => {
                this.massTransferTransaction = JSON.parse(data);
                const signedMassTranferTransaction = massTransfer(this.massTransferTransaction, this.trader.seed);

                broadcast(signedMassTranferTransaction, apiBase).then((data) => {
                    this.saveCompleteTransaction(data.id);
                }).catch(error => {
                    console.error(error);
                })
            }).catch(error => {
                console.error(error);
            })
        }
    }

    saveCompleteTransaction(data: string) {
        this.socketService.saveCompleteTransactionId(this.recId, data).subscribe(response => {
            console.log(response);
        }, error => {
            console.error(error);
        });
        localStorage.clear();
    }
}
