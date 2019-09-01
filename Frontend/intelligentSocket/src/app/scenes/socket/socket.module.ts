import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketPage } from './socket.page';
import { SocketInfoComponent } from './components/socket-info.component';

import {MatProgressBarModule} from '@angular/material';

@NgModule({
  imports: [
    MatProgressBarModule,
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: SocketPage }])
  ],
  declarations: [SocketPage, SocketInfoComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class SocketPageModule {}
