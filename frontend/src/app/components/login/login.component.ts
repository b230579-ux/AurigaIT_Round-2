import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-icon">🍱</div>
          <h2>Welcome Back</h2>
          <p>Sign in to your TiffinBox portal</p>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              class="form-control"
              placeholder="e.g. owner@tiffin.com"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              class="form-control"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" [disabled]="loading || !loginForm.form.valid" class="btn btn-primary btn-block btn-lg">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading">Signing in...</span>
          </button>
        </form>

        <div class="quick-demo-box">
          <p class="demo-title">⚡ Quick Test Account:</p>
          <button type="button" class="btn btn-outline btn-sm demo-btn" (click)="fillDemo('owner')">
            Fill Owner Account (owner&#64;tiffin.com)
          </button>
        </div>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/register" class="auth-link">Create Account</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: calc(100vh - 75px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
      background: radial-gradient(circle at 50% 10%, rgba(249, 115, 22, 0.06) 0%, rgba(255, 255, 255, 0) 50%);
    }
    .auth-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 2.5rem;
      width: 100%;
      max-width: 440px;
      box-shadow: var(--shadow-xl);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .auth-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .auth-header h2 {
      font-size: 1.75rem;
      margin-bottom: 0.25rem;
    }
    .auth-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .btn-block {
      width: 100%;
    }
    .quick-demo-box {
      margin-top: 1.5rem;
      padding: 1rem;
      background: var(--bg-subtle);
      border: 1px dashed var(--border-focus);
      border-radius: var(--radius-md);
      text-align: center;
    }
    .demo-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }
    .demo-btn {
      width: 100%;
      font-size: 0.825rem;
    }
    .auth-footer {
      margin-top: 1.75rem;
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .auth-link {
      color: var(--primary);
      font-weight: 700;
    }
    .auth-link:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  fillDemo(type: string): void {
    if (type === 'owner') {
      this.email = 'owner@tiffin.com';
      this.password = 'password123';
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password. Please try again.';
      }
    });
  }
}
