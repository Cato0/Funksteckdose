import { Input, OnInit, Component } from "@angular/core";
import { Socket } from "../../../definitions/socket";

@Component({
    selector: 'socket-info',
    templateUrl: 'socket-info.component.html',
    styleUrls: ['socket-info.component.scss']
})
export class SocketInfoComponent implements OnInit {
    @Input() socket: Socket;
    @Input() energyToToken: number;

    constructor() {}

    ngOnInit() {}

}