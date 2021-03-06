import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketsPage } from './sockets.page';
import { SocketSelectComponent } from './components/socket-select.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: SocketsPage }])
  ],
  declarations: [SocketsPage, SocketSelectComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class SocketsPageModule {}
