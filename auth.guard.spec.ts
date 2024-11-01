import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    authGuard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  it('should allow the authenticated user to access the route', () => {
    authService.isLoggedIn.and.returnValue(true);
    expect(authGuard.canActivate()).toBe(true);
  });

  it('should redirect an unauthenticated user to the login page', () => {
    authService.isLoggedIn.and.returnValue(false);
    const navigateSpy = spyOn(router, 'navigate');
    expect(authGuard.canActivate()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
