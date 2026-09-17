import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-brand">
          <div class="brand-icon">🍱</div>
          <div class="brand-text">
            <span class="brand-name">TiffinBox</span>
            <span class="brand-tag">Lunch Delivery</span>
          </div>
        </a>

        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Home</a>
          
          <ng-container *ngIf="authService.currentUser$ | async as user; else guestLinks">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
            
            <div class="user-badge-wrapper">
              <span class="user-pill">
                <span class="role-tag">{{ user.role === 'ROLE_OWNER' ? 'Owner' : 'Customer' }}</span>
                <span class="user-name">{{ user.name }}</span>
              </span>
              <button class="btn btn-outline btn-sm" (click)="logout()">Sign Out</button>
            </div>
          </ng-container>

          <ng-template #guestLinks>
            <a routerLink="/login" routerLinkActive="active" class="btn btn-outline btn-sm">Sign In</a>
            <a routerLink="/register" routerLinkActive="active" class="btn btn-primary btn-sm">Get Started</a>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: #ffffff;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(8px);
      background-color: rgba(255, 255, 255, 0.95);
    }
    .nav-container {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0.85rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand-icon {
      font-size: 1.8rem;
      line-height: 1;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-family: 'Outfit', sans-serif;
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-main);
    }
    .brand-tag {
      font-size: 0.72rem;
      color: var(--primary);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .nav-link {
      font-weight: 600;
      color: var(--text-muted);
      font-size: 0.925rem;
      transition: color 0.15s;
    }
    .nav-link:hover, .nav-link.active {
      color: var(--primary);
    }
    .user-badge-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-left: 0.5rem;
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-subtle);
      padding: 0.3rem 0.75rem;
      border-radius: var(--radius-full);
      border: 1px solid var(--border);
    }
    .role-tag {
      background: var(--primary);
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
    }
    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
