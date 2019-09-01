import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { Socket } from '../../definitions/socket';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'sockets',
  templateUrl: 'sockets.page.html',
  providers: [ SocketService, AlertController ],
  styleUrls: ['sockets.page.scss']
})
export class SocketsPage implements OnInit {
  sockets: Socket[]; 

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.socketService.getSockets().subscribe(sockets => {
      this.sockets = sockets;
    });
 
  }
}
