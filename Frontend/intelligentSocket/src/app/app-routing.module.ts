import { NgModule, InjectionToken } from '@angular/core';
import { Routes, RouterModule, ActivatedRouteSnapshot } from '@angular/router';
import { NotFoundComponent } from './errors/not-found.component';
import { SocketsPageModule } from './scenes/sockets/sockets.module';
import { SocketPageModule } from './scenes/socket/socket.module';
import { FirstStepSuccessPageModule } from './scenes/first-step-success/first-step-success.module';

const externalUrlProvider = new InjectionToken('externalUrlRedirectResolver');
const deactivateGuard = new InjectionToken('deactivateGuard');
const routes: Routes = [
  { 
    path: '', 
    loadChildren: './scenes/sockets/sockets.module#SocketsPageModule',
    // canDeactivate: [deactivateGuard],
  },
  {
    path: 'socket/:id',
    loadChildren: './scenes/socket/socket.module#SocketPageModule'
  },
  {
    path: 'firstStepSuccess',
    loadChildren: './scenes/first-step-success/first-step-success.module#FirstStepSuccessPageModule'
  }
];

@NgModule({
  providers: [{
    provide: externalUrlProvider,
    useValue: (route: ActivatedRouteSnapshot) => {        
      const externalUrl = route.paramMap.get('externalUrl');
      window.open(externalUrl, '_self');
    },
  },
  {
    provide: deactivateGuard,
    useValue: () => {
      console.log('Guard function is called!')      
      return false;
    }
  }],
  imports: [RouterModule.forRoot(routes), 
    SocketsPageModule, 
    SocketPageModule,
    FirstStepSuccessPageModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}
