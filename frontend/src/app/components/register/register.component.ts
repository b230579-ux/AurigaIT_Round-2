import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-icon">📝</div>
          <h2>Create an Account</h2>
          <p>Register as a Tiffin customer or business owner</p>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>

        <div *ngIf="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              [(ngModel)]="name"
              required
              class="form-control"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="phone">Phone Number (10 digits)</label>
            <input
              type="text"
              id="phone"
              name="phone"
              [(ngModel)]="phone"
              required
              class="form-control"
              placeholder="e.g. 9876543210"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              class="form-control"
              placeholder="e.g. rahul@example.com"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password (at least 6 characters)</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              minlength="6"
              class="form-control"
              placeholder="••••••••"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Register As</label>
            <div class="role-selector">
              <label class="role-option" [class.selected]="role === 'CUSTOMER'">
                <input type="radio" name="role" [(ngModel)]="role" value="CUSTOMER" />
                <span class="role-title">Customer</span>
                <span class="role-sub">Subscribe to lunches</span>
              </label>
              <label class="role-option" [class.selected]="role === 'OWNER'">
                <input type="radio" name="role" [(ngModel)]="role" value="OWNER" />
                <span class="role-title">Tiffin Owner</span>
                <span class="role-sub">Manage kitchen & billing</span>
              </label>
            </div>
          </div>

          <button type="submit" [disabled]="loading || !registerForm.form.valid" class="btn btn-primary btn-block btn-lg">
            <span *ngIf="!loading">Create Account</span>
            <span *ngIf="loading">Creating account...</span>
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/login" class="auth-link">Sign In</a>
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
      max-width: 480px;
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
    .role-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .role-option {
      border: 1px solid var(--border);
      padding: 0.75rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: all 0.15s;
    }
    .role-option input {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
    }
    .role-option.selected {
      border-color: var(--primary);
      background: var(--primary-50);
    }
    .role-title {
      font-weight: 700;
      font-size: 0.9rem;
    }
    .role-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
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
export class RegisterComponent {
  name = '';
  phone = '';
  email = '';
  password = '';
  role = 'CUSTOMER';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.authService.register({
      name: this.name,
      phone: this.phone,
      email: this.email,
      password: this.password,
      role: this.role
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Account created successfully! Redirecting to sign in...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please check inputs.';
      }
    });
  }
}
