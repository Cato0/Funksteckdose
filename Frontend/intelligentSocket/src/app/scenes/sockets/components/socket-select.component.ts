import { Input, OnInit, Component, Output, EventEmitter } from "@angular/core";
import { Socket } from "../../../definitions/socket";
import { Router } from "@angular/router";

@Component({
    selector: 'socket-select',
    templateUrl: 'socket-select.component.html',
    styleUrls: ['socket-select.component.scss']
})
export class SocketSelectComponent implements OnInit {
    @Input() choice: number;
    @Output() choiceChange = new EventEmitter<number>();

    @Input() sockets: Socket[];

    constructor(private router: Router) {}

    ngOnInit() {}

    select(socket: Socket) {
        this.choice !== socket.id ? this.choice = socket.id : this.choice = -1;
        this.choiceChange.emit(this.choice);
        this.router.navigate(['socket/' + socket.id]);
    }
}