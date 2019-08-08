import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { JhiPaginationUtil, JhiResolvePagingParams } from 'ng-jhipster';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Rate } from 'app/shared/model/rate.model';
import { RateService } from './rate.service';
import { RateComponent } from './rate.component';
import { RateDetailComponent } from './rate-detail.component';
import { RateUpdateComponent } from './rate-update.component';
import { RateDeletePopupComponent } from './rate-delete-dialog.component';
import { IRate } from 'app/shared/model/rate.model';

@Injectable({ providedIn: 'root' })
export class RateResolve implements Resolve<IRate> {
  constructor(private service: RateService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IRate> {
    const id = route.params['id'] ? route.params['id'] : null;
    if (id) {
      return this.service.find(id).pipe(
        filter((response: HttpResponse<Rate>) => response.ok),
        map((rate: HttpResponse<Rate>) => rate.body)
      );
    }
    return of(new Rate());
  }
}

export const rateRoute: Routes = [
  {
    path: '',
    component: RateComponent,
    resolve: {
      pagingParams: JhiResolvePagingParams
    },
    data: {
      authorities: ['ROLE_USER'],
      defaultSort: 'id,asc',
      pageTitle: 'iCounselingApp.rate.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/view',
    component: RateDetailComponent,
    resolve: {
      rate: RateResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'iCounselingApp.rate.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: 'new',
    component: RateUpdateComponent,
    resolve: {
      rate: RateResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'iCounselingApp.rate.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/edit',
    component: RateUpdateComponent,
    resolve: {
      rate: RateResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'iCounselingApp.rate.home.title'
    },
    canActivate: [UserRouteAccessService]
  }
];

export const ratePopupRoute: Routes = [
  {
    path: ':id/delete',
    component: RateDeletePopupComponent,
    resolve: {
      rate: RateResolve
    },
    data: {
      authorities: ['ROLE_USER'],
      pageTitle: 'iCounselingApp.rate.home.title'
    },
    canActivate: [UserRouteAccessService],
    outlet: 'popup'
  }
];
