import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Script } from 'src/app/definitions/script';
import { Address } from 'src/app/definitions/address';
import { ITransferTransaction, IMassTransferTransaction } from '@waves/waves-transactions/dist/transactions';
import { AlertController } from '@ionic/angular';
import { delay } from 'rxjs/operators';
import { Socket, SocketStatus } from 'src/app/definitions/socket';
import { broadcast, setScript, transfer, massTransfer } from '@waves/waves-transactions';
import { TransactionModel } from 'src/app/definitions/addTransaction';
import { Asset } from 'src/app/definitions/asset';
const wc = require('@waves/waves-crypto');

const apiBase = 'https://testnode1.wavesnodes.com'; // 'https://pool.testnet.wavesnodes.com'; 
const scriptTemplate = "let centPerWatt = 25;"
                     + "let customerPubKey = base58':customerKey';"
                     + "let traderPubKey = base58':traderKey';"
                     + "let customerSigned = if(sigVerify(tx.bodyBytes, tx.proofs[0], customerPubKey) || sigVerify(tx.bodyBytes, tx.proofs[1], customerPubKey)) then 1 else 0;"
                     + "let traderSigned = if(sigVerify(tx.bodyBytes, tx.proofs[1], traderPubKey) || sigVerify(tx.bodyBytes, tx.proofs[0], traderPubKey)) then 1 else 0;"
                     + "customerSigned + traderSigned >= 2";
                     
@Component({
  selector: 'first-step-success',
  templateUrl: 'first-step-success.page.html',
  providers: [ SocketService ],
  styleUrls: ['first-step-success.page.scss']
})
export class FirstStepSuccessPage implements OnInit {
  recId: string;
  transactionId: string;
  compiledScript: Script;
  
  customer: Address;
  multiSignatureAccount: Address;
  trader: Address;
  socket: Socket;
  asset: Asset;
  
  backupTransfer: string;
  backupTransferSigned: string;
  backupTransferTransaction: ITransferTransaction;

  massTransferTransaction: IMassTransferTransaction;

  backup: boolean = false
  loadingReady: boolean = false;
  loadingStarted: boolean = false;

  constructor(private socketService: SocketService,
    public alertCtrl: AlertController,
              private router: Router, 
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.socketService.getTrader().subscribe(trader => {
      this.trader = trader;
    }, error => {
      console.error(error);
    });
    this.socketService.getAsset().subscribe(asset => {
      this.asset = asset;
    }, error => {
      console.error(error);
    });
    this.transactionId = this.route.snapshot.queryParamMap.get('txId');
    if (!this.transactionId) {
      console.log('No transaction-id retrieved.');
    } else {
      localStorage.setItem('initialTransactionFromCustomer', this.transactionId);
      console.log('Retrieved the following transaction-id: ' + this.transactionId);
      this.check();
    }
  }

  check() {    
    // Check wether transaction was complete or not.
    this.socketService.checkTransaction(this.transactionId).subscribe((result) => {
      if (result && result.proofs && result.proofs.length >= 1) {
        console.log('transaction was successful');
        this.buildScript();
      } else {
        console.log('transaction was not successful');
      }
    });
  }

  buildScript() {
    let replacedScript = scriptTemplate.replace(':customerKey', this.customer.publicKey);
    replacedScript = replacedScript.replace(':traderKey', this.trader.publicKey);

    this.socketService.compileScript(replacedScript).subscribe(script => {
      this.compiledScript = script;        
      this.attachScript();
    });
  }

  attachScript() {
    // Before attaching Script to multiSignatureAccount, transfer some Waves from Trader to MultiSigAccount for necessary transaction-fees
    // Transfer 0.01 Waves onto the MultiSigAccount from trader for setScriptTransaction.
    // Transfer 0.06 Waves onto the MultiSigAccount from trader for massTransferTransaction.
    const signedSetupTx = transfer({
      amount: 0.01 * 7 * Math.pow(10, 8),
      recipient: localStorage.getItem('multiSignatureAddress')
    }, this.trader.seed);
    localStorage.setItem('setupTransaction', signedSetupTx.id);
    broadcast(signedSetupTx, apiBase).then((response) => {
      if (response && response.proofs && response.proofs.length >= 1 && response.type == 4) {
        const setScriptTransaction = setScript({ 
          script: this.compiledScript.script,
          senderPublicKey: localStorage.getItem('multiSignaturePublicKey'),
          chainId: 'T'
        }, localStorage.getItem('multiSignatureSeed'));

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
    this.backupTransfer = JSON.stringify(transfer({
      recipient: this.trader.address,
      amount: (Number.parseInt(localStorage.getItem('token')) * Math.pow(10, 8)).toString(),
      senderPublicKey: localStorage.getItem('customerPublicKey')
    }, localStorage.getItem('multiSignatureSeed')));
    this.backup = true;
  }

  parseBackup() {
    if (this.backupTransferSigned) {
      let data: TransactionModel = {
        _customerAddress: localStorage.getItem('customerAddress').toString(), 
        _customerPublicKey: localStorage.getItem('customerPublicKey').toString(), 
        _multiSignatureAddress: localStorage.getItem('multiSignatureAddress').toString(), 
        _multiSignaturePublicKey: localStorage.getItem('multiSignaturePublicKey').toString(), 
        _multiSignatureSeed: localStorage.getItem('multiSignatureSeed').toString(),
        _socketId: localStorage.getItem('socketId').toString(),
        _socketEnergy: localStorage.getItem('energy').toString(),
        _token: localStorage.getItem('token').toString(),
        _energyToToken: localStorage.getItem('energyToToken').toString(),
        _initialTransactionIdFromCustomer: localStorage.getItem('initialTransactionFromCustomer').toString(),
        _setupTransactionId: localStorage.getItem('setupTransaction').toString(),
        _setScriptTransactionId: localStorage.getItem('setScriptTransaction').toString(),
        _backupTransaction: JSON.parse(this.backupTransferSigned)
    };
      this.socketService.setInitialDatabaseRecord(data).subscribe(response => {
        console.log(response);
        this.recId = response;
        localStorage.setItem('recId', this.recId);
      }, error => {
        console.error(error);
      }); 
    }             
  }

  startLoadingProcess() {
    this.socketService.startLoadingProcess(this.recId).subscribe((response) => {
        this.loadingStarted = true;
        this.socket.status = SocketStatus.CHARGING;
    }, (error) => {
        console.log(error);
    });
  }

  stopLoadingProcess() {
      this.recId = localStorage.getItem('recId');    
      this.socketService.stopLoadingProcess(this.recId).subscribe((response) => {
          console.log(response);

          if (response === false) {
              console.log('Stopping charging did not work.');
          } else {
              console.log('Charging process stopped.');
              this.loadingStarted = false;
              this.socket.status = SocketStatus.CHARGING_FINISHED;
              // Also get backupTransaction from backend
              this.backupTransferTransaction = JSON.parse(response.backupTransaction);
              this.completeProcess(response.tokensForCustomer, response.tokensForTrader);
          }
      });
  }

  completeProcess(tokensForCustomer: number, tokensForTrader: number) {
      if (tokensForCustomer == 0) {
          console.log('Customer has charged for all his tokens. We dont need to give him some back.');
          broadcast(this.backupTransferTransaction, apiBase).then((data) => {
              console.log(data);
              console.log('all to trader');
              // TODO: Write transaction id to database
              this.saveCompleteTransaction(data.id);
          }).catch(error => {
              console.log(error);
              console.log('all to trader. something went wrong');
          });
      } else {
          console.log('Customer stopped charging process before all his token were spend. We need to give him some back.');
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
              console.log(data);
              this.massTransferTransaction = JSON.parse(data);
              const signedMassTranferTransaction = massTransfer(this.massTransferTransaction, this.trader.seed);

              broadcast(signedMassTranferTransaction, apiBase).then((data) => {
                  console.log(data);
                  console.log('MassTransfer completed');
                  // Remove all from localStorage
                  // TODO: Write transaction id to database
                  this.saveCompleteTransaction(data.id);
              }).catch(error => {
                  console.log(error);
                  console.log('Masstransfer. something went wrong');
              })
          }).catch(error => {
              console.log(error);
              console.log('signing went wrong.');
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
