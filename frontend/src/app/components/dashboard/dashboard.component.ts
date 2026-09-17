import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiffinService } from '../../services/tiffin.service';
import { AuthService } from '../../services/auth.service';
import { DashboardStats, Subscription, BillResponse, User } from '../../models/tiffin.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">

      <!-- Alert Banner -->
      <div *ngIf="alertMessage" class="alert" [ngClass]="alertType === 'error' ? 'alert-danger' : 'alert-success'">
        {{ alertMessage }}
        <button class="close-alert" (click)="alertMessage = ''">×</button>
      </div>

      <!-- ========================================================================= -->
      <!-- 1. OWNER LAYOUT                                                           -->
      <!-- ========================================================================= -->
      <ng-container *ngIf="isOwner; else customerLayout">
        <!-- Top Welcome Banner (Owner) -->
        <header class="dash-header">
          <div>
            <div class="role-indicator">Owner Operations Portal</div>
            <h1 class="dash-title">Tiffin Operations & Billing</h1>
            <p class="dash-subtitle">Track active weekday deliveries, manage customer pauses, and generate pro-rated month-end invoices.</p>
          </div>
          <div class="dash-actions">
            <button class="btn btn-outline" (click)="openClockModal()">
              ⏰ Clock & Outbox
            </button>
            <button class="btn btn-outline" (click)="openImportModal()">
              📥 Import Messy List
            </button>
            <button class="btn btn-outline" (click)="openBillingModal()">
              🧮 Monthly Invoices
            </button>
            <button class="btn btn-primary" (click)="openNewSubModal()">
              + New Subscription
            </button>
          </div>
        </header>

        <!-- Stats Grid (Owner) -->
        <section class="stats-grid">
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Total Customers</span>
              <span class="stat-icon">👥</span>
            </div>
            <div class="stat-value">{{ stats?.totalCustomers ?? 0 }}</div>
            <div class="stat-sub">Registered foodies</div>
          </div>

          <div class="stat-card stat-card-active">
            <div class="stat-header">
              <span class="stat-label">Active Delivering</span>
              <span class="stat-icon">🟢</span>
            </div>
            <div class="stat-value text-success">{{ stats?.activeSubscriptions ?? 0 }}</div>
            <div class="stat-sub">Meals being prepared today</div>
          </div>

          <div class="stat-card stat-card-paused">
            <div class="stat-header">
              <span class="stat-label">Currently Paused</span>
              <span class="stat-icon">⏸️</span>
            </div>
            <div class="stat-value text-warning">{{ stats?.pausedSubscriptions ?? 0 }}</div>
            <div class="stat-sub">Not billed during pause</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Monthly Potential</span>
              <span class="stat-icon">💰</span>
            </div>
            <div class="stat-value">₹{{ stats?.monthlyRevenueEstimate | number:'1.0-0' }}</div>
            <div class="stat-sub">Before pause deductions</div>
          </div>
        </section>

        <!-- Lookup by Phone & Search Toolbar (Owner) -->
        <section class="toolbar-card">
          <div class="toolbar-grid">
            <!-- Quick Phone Lookup -->
            <div class="lookup-box">
              <label class="toolbar-label">Instant Phone Lookup</label>
              <div class="input-with-button">
                <input
                  type="text"
                  [(ngModel)]="searchPhone"
                  (keyup.enter)="lookupByPhone()"
                  placeholder="Lookup phone (e.g. 9876543211)"
                  class="form-control"
                />
                <button class="btn btn-secondary" (click)="lookupByPhone()">Lookup</button>
              </div>
            </div>

            <!-- General Search & Filter -->
            <div class="filter-box">
              <label class="toolbar-label">Filter Subscriptions</label>
              <div class="filter-controls">
                <div class="tabs">
                  <button
                    class="tab-btn"
                    [class.active]="selectedStatus === 'ALL'"
                    (click)="filterByStatus('ALL')"
                  >
                    All ({{ subscriptions.length }})
                  </button>
                  <button
                    class="tab-btn tab-active"
                    [class.active]="selectedStatus === 'ACTIVE'"
                    (click)="filterByStatus('ACTIVE')"
                  >
                    Active ({{ countStatus('ACTIVE') }})
                  </button>
                  <button
                    class="tab-btn tab-paused"
                    [class.active]="selectedStatus === 'PAUSED'"
                    (click)="filterByStatus('PAUSED')"
                  >
                    Paused ({{ countStatus('PAUSED') }})
                  </button>
                </div>

                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="applyLocalFilter()"
                  placeholder="Search name or plan..."
                  class="form-control search-input"
                />
              </div>
            </div>
          </div>

          <!-- Phone Lookup Result Banner -->
          <div *ngIf="lookupResult" class="phone-result-card">
            <div class="phone-result-header">
              <div>
                <span class="result-badge">Customer Found</span>
                <h3>{{ lookupResult.name }}</h3>
                <p>Phone: {{ lookupResult.phone }} • Email: {{ lookupResult.email }}</p>
              </div>
              <button class="btn btn-outline btn-sm" (click)="lookupResult = null">Dismiss</button>
            </div>
          </div>
        </section>

        <!-- Subscriptions Table (Owner) -->
        <section class="table-card">
          <div class="table-header">
            <h2>Customer Subscriptions</h2>
            <span class="table-count">Showing {{ filteredSubscriptions.length }} subscriptions</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plan Details</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Pause Details</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let sub of filteredSubscriptions">
                  <td>
                    <div class="customer-info">
                      <span class="customer-name">{{ sub.customer?.name }}</span>
                      <span class="customer-phone">📞 {{ sub.customer?.phone }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="plan-info">
                      <span class="badge" [ngClass]="'badge-plan-' + sub.planName.toLowerCase()">
                        {{ sub.planName }}
                      </span>
                      <span class="plan-price">₹{{ sub.planPrice | number:'1.2-2' }}/mo</span>
                    </div>
                  </td>
                  <td>
                    <span
                      class="badge"
                      [ngClass]="sub.status === 'ACTIVE' ? 'badge-active' : (sub.status === 'PAUSED' ? 'badge-paused' : 'badge-cancelled')"
                    >
                      {{ sub.status }}
                    </span>
                  </td>
                  <td>{{ sub.startDate }}</td>
                  <td>
                    <span *ngIf="sub.status === 'PAUSED' && sub.currentPause" class="pause-tag">
                      Paused: {{ sub.currentPause.startDate }}
                      <span *ngIf="sub.currentPause.reason">({{ sub.currentPause.reason }})</span>
                    </span>
                    <span *ngIf="sub.status !== 'PAUSED'" class="text-muted text-sm">
                      Delivering Mon–Fri
                    </span>
                  </td>
                  <td class="text-right actions-col">
                    <button
                      *ngIf="sub.status === 'ACTIVE'"
                      class="btn btn-outline btn-sm btn-action-pause"
                      (click)="openPauseModal(sub)"
                    >
                      ⏸️ Pause
                    </button>
                    <button
                      *ngIf="sub.status === 'ACTIVE'"
                      class="btn btn-outline btn-sm"
                      (click)="openTransferModal(sub)"
                      title="Transfer subscription to a new customer mid-cycle"
                    >
                      🔄 Transfer
                    </button>
                    <button
                      *ngIf="sub.status === 'PAUSED'"
                      class="btn btn-primary btn-sm btn-action-resume"
                      (click)="resumeSubscription(sub)"
                    >
                      ▶️ Resume
                    </button>
                    <button
                      class="btn btn-outline btn-sm"
                      (click)="openSubBilling(sub)"
                      title="Calculate pro-rated bill"
                    >
                      🧾 Bill
                    </button>
                  </td>
                </tr>

                <tr *ngIf="filteredSubscriptions.length === 0">
                  <td colspan="6" class="empty-state">
                    <p>No subscriptions match your search or filter.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </ng-container>

      <!-- ========================================================================= -->
      <!-- 2. CUSTOMER LAYOUT                                                        -->
      <!-- ========================================================================= -->
      <ng-template #customerLayout>
        <!-- Top Welcome Banner (Customer) -->
        <header class="dash-header">
          <div>
            <div class="role-indicator customer-tag">Customer Portal</div>
            <h1 class="dash-title">Hello, {{ currentUser?.name }}! 👋</h1>
            <p class="dash-subtitle">Manage your daily lunch deliveries, view your pro-rated bills, and explore verified home-style tiffin kitchens.</p>
          </div>
        </header>

        <!-- Current Active / Paused Subscription Card -->
        <section class="customer-sub-section">
          <div *ngIf="mySubscription; else noSubscriptionCard" class="card active-sub-card">
            <div class="sub-card-header">
              <div class="sub-title-group">
                <span class="sub-label">My Current Lunch Subscription</span>
                <h2>{{ mySubscription.planName }} Tiffin Plan</h2>
              </div>
              <div class="sub-status-badge">
                <span
                  class="badge badge-lg"
                  [ngClass]="mySubscription.status === 'ACTIVE' ? 'badge-active' : 'badge-paused'"
                >
                  {{ mySubscription.status === 'ACTIVE' ? '🟢 Active & Delivering' : '⏸️ Currently Paused' }}
                </span>
              </div>
            </div>

            <div class="sub-card-body">
              <div class="sub-metric">
                <span class="metric-label">Monthly Price</span>
                <span class="metric-value">₹{{ mySubscription.planPrice | number:'1.2-2' }}</span>
                <span class="metric-note">Pro-rated for paused days</span>
              </div>
              <div class="sub-metric">
                <span class="metric-label">Delivery Schedule</span>
                <span class="metric-value schedule-text">Mon – Fri (Weekdays)</span>
                <span class="metric-note">Lunch time: 12:30 PM - 1:30 PM</span>
              </div>
              <div class="sub-metric">
                <span class="metric-label">Started On</span>
                <span class="metric-value">{{ mySubscription.startDate }}</span>
                <span class="metric-note">Active auto-renewal</span>
              </div>
            </div>

            <div class="sub-card-footer">
              <div class="pause-status-msg">
                <span *ngIf="mySubscription.status === 'ACTIVE'">
                  ✨ <strong>Delivering today!</strong> Need to travel or take a day off? Pause with zero billing dispute.
                </span>
                <span *ngIf="mySubscription.status === 'PAUSED'" class="text-warning">
                  ⏸️ <strong>Your meals are currently paused.</strong> You will not be charged for weekdays on pause.
                </span>
              </div>
              <div class="sub-card-actions">
                <button
                  *ngIf="mySubscription.status === 'ACTIVE'"
                  class="btn btn-outline btn-warning-action"
                  (click)="openPauseModal(mySubscription)"
                >
                  ⏸️ Pause Deliveries
                </button>
                <button
                  *ngIf="mySubscription.status === 'PAUSED'"
                  class="btn btn-primary"
                  (click)="resumeSubscription(mySubscription)"
                >
                  ▶️ Resume Deliveries
                </button>
              </div>
            </div>
          </div>

          <ng-template #noSubscriptionCard>
            <div class="card empty-sub-card">
              <div class="empty-sub-icon">🍱</div>
              <h3>No Active Lunch Subscription Yet</h3>
              <p>You haven't subscribed to any daily lunch service yet. Choose an available kitchen below to start enjoying home-style weekday meals!</p>
            </div>
          </ng-template>
        </section>

        <!-- Available Tiffin Providers & Kitchens (The Customer View Highlight) -->
        <section class="providers-section">
          <div class="section-title-box">
            <h2>🍲 Available Tiffin Services & Kitchens</h2>
            <p>Verified home chefs delivering fresh, hygienic weekday lunches near you.</p>
          </div>

          <div class="providers-grid">
            <div *ngFor="let provider of tiffinProviders" class="card provider-card">
              <div class="provider-badge">Verified Kitchen</div>
              <div class="provider-header">
                <div class="kitchen-avatar">🍳</div>
                <div>
                  <h3 class="kitchen-name">{{ provider.name }}'s Kitchen</h3>
                  <p class="kitchen-contact">📞 {{ provider.phone }} • ✉️ {{ provider.email }}</p>
                </div>
              </div>

              <div class="menu-tiers">
                <div class="menu-tier">
                  <div class="tier-name">Basic Tiffin</div>
                  <div class="tier-desc">4 Rotis, Seasonal Sabzi</div>
                  <div class="tier-price">₹2,000<span>/mo</span></div>
                </div>
                <div class="menu-tier featured-tier">
                  <div class="tier-name">Standard Tiffin ⭐</div>
                  <div class="tier-desc">Rotis, Sabzi, Dal, Rice & Salad</div>
                  <div class="tier-price">₹3,000<span>/mo</span></div>
                </div>
                <div class="menu-tier">
                  <div class="tier-name">Premium Feast</div>
                  <div class="tier-desc">Rotis, 2 Sabzis, Dal, Rice & Sweet</div>
                  <div class="tier-price">₹4,500<span>/mo</span></div>
                </div>
              </div>

              <div class="provider-footer">
                <button
                  class="btn btn-primary btn-block"
                  (click)="subscribeToKitchen(provider)"
                >
                  Subscribe to {{ provider.name }}
                </button>
              </div>
            </div>

            <div *ngIf="tiffinProviders.length === 0" class="card empty-providers">
              <p>No tiffin providers currently registered. Please check back soon!</p>
            </div>
          </div>
        </section>

        <!-- Customer Invoice History -->
        <section class="invoices-section" *ngIf="myInvoices.length > 0">
          <div class="section-title-box">
            <h2>🧾 My Bills & Pro-Rated Statements</h2>
            <p>Transparent summary showing total weekdays, paused days, and actual delivered meals.</p>
          </div>

          <div class="card table-card">
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Billing Period</th>
                    <th>Plan</th>
                    <th>Total Weekdays</th>
                    <th>Paused Days</th>
                    <th>Delivered Days</th>
                    <th>Full Monthly Rate</th>
                    <th>Final Billed Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let inv of myInvoices">
                    <td><strong>{{ inv.billingMonth }}/{{ inv.billingYear }}</strong></td>
                    <td><span class="badge badge-plan-standard">{{ inv.planName }}</span></td>
                    <td>{{ inv.totalWeekdays }} days</td>
                    <td class="text-warning font-bold">{{ inv.pausedDays }} days</td>
                    <td class="text-success font-bold">{{ inv.deliveredDays }} days</td>
                    <td>₹{{ inv.planPrice | number:'1.2-2' }}</td>
                    <td><span class="final-bill-amount">₹{{ inv.billedAmount | number:'1.2-2' }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </ng-template>

      <!-- ── Pause Modal (Shared) ── -->
      <div class="modal-backdrop" *ngIf="showPauseModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Pause Lunch Deliveries</h3>
            <button class="modal-close" (click)="showPauseModal = false">×</button>
          </div>
          <div class="modal-body">
            <p class="modal-intro">
              Pause weekday lunch deliveries. Paused weekdays will be automatically subtracted from your month-end bill.
            </p>
            <div class="form-group">
              <label class="form-label">Reason (optional)</label>
              <input
                type="text"
                [(ngModel)]="pauseReason"
                class="form-control"
                placeholder="e.g. Traveling for festival, Visiting hometown, Sick"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showPauseModal = false">Cancel</button>
            <button class="btn btn-warning" (click)="confirmPause()">Confirm Pause</button>
          </div>
        </div>
      </div>

      <!-- ── Owner Month-End Billing Modal ── -->
      <div class="modal-backdrop" *ngIf="showBillingModal">
        <div class="modal-card modal-lg">
          <div class="modal-header">
            <h3>Month-End Pro-Rated Billing</h3>
            <button class="modal-close" (click)="showBillingModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="billing-controls">
              <div class="form-group">
                <label class="form-label">Month</label>
                <select [(ngModel)]="billingMonth" class="form-control">
                  <option [value]="1">January</option>
                  <option [value]="2">February</option>
                  <option [value]="3">March</option>
                  <option [value]="4">April</option>
                  <option [value]="5">May</option>
                  <option [value]="6">June</option>
                  <option [value]="7">July</option>
                  <option [value]="8">August</option>
                  <option [value]="9">September</option>
                  <option [value]="10">October</option>
                  <option [value]="11">November</option>
                  <option [value]="12">December</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Year</label>
                <input type="number" [(ngModel)]="billingYear" class="form-control" />
              </div>
              <div class="form-group btn-align">
                <button class="btn btn-primary" (click)="generateInvoices()" [disabled]="calculatingBill">
                  {{ calculatingBill ? 'Calculating...' : 'Generate Invoices' }}
                </button>
              </div>
            </div>

            <!-- Invoices Table -->
            <div *ngIf="invoices.length > 0" class="invoices-list">
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Plan</th>
                      <th>Total Wkdays</th>
                      <th>Paused</th>
                      <th>Delivered</th>
                      <th>Monthly Fee</th>
                      <th>Pro-Rated Bill</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let inv of invoices">
                      <td>
                        <strong>{{ inv.customerName }}</strong>
                        <div class="text-sm text-muted">{{ inv.customerPhone }}</div>
                      </td>
                      <td>
                        <span class="badge badge-plan-standard">{{ inv.planName }}</span>
                      </td>
                      <td>{{ inv.totalWeekdays }} days</td>
                      <td class="text-warning font-bold">{{ inv.pausedDays }} days</td>
                      <td class="text-success font-bold">{{ inv.deliveredDays }} days</td>
                      <td>₹{{ inv.planPrice | number:'1.2-2' }}</td>
                      <td>
                        <span class="final-bill-amount">₹{{ inv.billedAmount | number:'1.2-2' }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="billing-explainer">
                💡 <strong>Fair Pro-rating Rule:</strong> Daily Rate = (Plan Price ÷ Total Weekdays in Month). Final Bill = Daily Rate × Delivered Weekdays.
              </div>
            </div>

            <div *ngIf="invoices.length === 0 && !calculatingBill" class="empty-state">
              <p>Click "Generate Invoices" to calculate pro-rated bills for all customers for the selected month.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showBillingModal = false">Close</button>
          </div>
        </div>
      </div>

      <!-- ── New Subscription Modal ── -->
      <div class="modal-backdrop" *ngIf="showNewSubModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Subscribe to Tiffin</h3>
            <button class="modal-close" (click)="showNewSubModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group" *ngIf="isOwner">
              <label class="form-label">Select Customer</label>
              <select [(ngModel)]="newSubCustomerId" class="form-control">
                <option [ngValue]="null">-- Choose Customer --</option>
                <option *ngFor="let c of customersList" [ngValue]="c.id">
                  {{ c.name }} ({{ c.phone }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Select Meal Plan</label>
              <select [(ngModel)]="newSubPlan" class="form-control">
                <option value="BASIC">Basic Tiffin (4 Rotis + Sabzi) - ₹2,000/mo</option>
                <option value="STANDARD">Standard Tiffin (Rotis, Sabzi, Dal, Rice, Salad) - ₹3,000/mo</option>
                <option value="PREMIUM">Premium Feast (Rotis, 2 Sabzis, Dal, Rice, Sweet) - ₹4,500/mo</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showNewSubModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="createSubscription()">
              Confirm Subscription
            </button>
          </div>
      <!-- ── Clock & Outbox Modal (Twist 1: T1) ── -->
      <div class="modal-backdrop" *ngIf="showClockModal">
        <div class="modal-card modal-lg">
          <div class="modal-header">
            <h3>⏰ Morning Delivery Clock & Outbox (T1)</h3>
            <button class="modal-close" (click)="showClockModal = false">×</button>
          </div>
          <div class="modal-body">
            <p class="modal-intro">
              Triggers the morning delivery notification runner for the specified date. Only active weekday subscriptions not currently paused are queued into the Notification Outbox.
            </p>
            <div class="billing-controls" style="margin-bottom: 1.25rem;">
              <div class="form-group">
                <label class="form-label">Simulation Date</label>
                <input type="date" [(ngModel)]="clockDate" class="form-control" />
              </div>
              <div class="form-group btn-align">
                <button class="btn btn-primary" (click)="tickClock()" [disabled]="tickingClock">
                  {{ tickingClock ? 'Ticking Clock...' : '⚡ POST /clock' }}
                </button>
                <button class="btn btn-outline" (click)="loadOutbox()" [disabled]="loadingOutbox">
                  🔄 Refresh Outbox
                </button>
              </div>
            </div>

            <!-- Clock Execution Result -->
            <div *ngIf="clockResult" class="card" [ngClass]="clockResult.deliveriesCount > 0 ? 'alert-success' : 'alert-info'" style="margin-bottom: 1.25rem; padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-weight: 700; margin-bottom: 0.25rem;">
                📅 {{ clockResult.date }} ({{ clockResult.dayOfWeek }}) — {{ clockResult.isWeekday ? 'Weekday' : 'Weekend' }}
              </div>
              <div>{{ clockResult.message }}</div>
              <div style="font-size: 0.85rem; margin-top: 0.35rem; opacity: 0.9;">
                Deliveries Queued Today: <strong>{{ clockResult.deliveriesCount }}</strong>
              </div>
            </div>

            <!-- Outbox Messages Table -->
            <div class="table-responsive" style="max-height: 320px; overflow-y: auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let msg of outboxMessages">
                    <td>
                      <strong>{{ msg.recipientName }}</strong>
                      <div class="text-sm text-muted">📞 {{ msg.recipientPhone }}</div>
                    </td>
                    <td><span class="badge badge-plan-standard">{{ msg.subject }}</span></td>
                    <td style="font-size: 0.85rem; max-width: 280px;">{{ msg.message }}</td>
                    <td>
                      <span class="badge badge-active">{{ msg.status }}</span>
                    </td>
                    <td class="text-sm text-muted">{{ msg.createdAt | date:'short' }}</td>
                  </tr>
                  <tr *ngIf="outboxMessages.length === 0">
                    <td colspan="5" class="empty-state">
                      <p>No notifications in outbox yet. Tick the clock for a weekday to notify customers.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showClockModal = false">Close</button>
          </div>
        </div>
      </div>

      <!-- ── Subscription Transfer Modal (Twist 2: T6) ── -->
      <div class="modal-backdrop" *ngIf="showTransferModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>🔄 Mid-Cycle Subscription Transfer (T6)</h3>
            <button class="modal-close" (click)="showTransferModal = false">×</button>
          </div>
          <div class="modal-body">
            <p class="modal-intro">
              Transfer plan & billing cycle to a new customer mid-cycle. The plan carries over and billing will be automatically split pro-rata based on who was served.
            </p>

            <div class="card" style="background: var(--bg-main); padding: 1rem; margin-bottom: 1.25rem; border: 1px solid var(--border);">
              <div style="font-size: 0.85rem; color: var(--text-muted);">Current Subscription</div>
              <div style="font-weight: 700; font-size: 1.05rem;">{{ subToTransfer?.customer?.name }} ({{ subToTransfer?.customer?.phone }})</div>
              <div style="font-size: 0.875rem; margin-top: 0.25rem;">
                Plan: <span class="badge badge-plan-standard">{{ subToTransfer?.planName }}</span> • ₹{{ subToTransfer?.planPrice | number:'1.2-2' }}/mo
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">New Customer Phone (10 digits) *</label>
              <input
                type="text"
                [(ngModel)]="transferPhone"
                class="form-control"
                placeholder="e.g. 9876543210"
              />
            </div>

            <div class="form-group">
              <label class="form-label">New Customer Name (if registering new)</label>
              <input
                type="text"
                [(ngModel)]="transferName"
                class="form-control"
                placeholder="e.g. Vikram Sharma"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Effective Transfer Date *</label>
              <input
                type="date"
                [(ngModel)]="transferDate"
                class="form-control"
              />
              <span class="text-muted text-sm">Previous customer is billed up to day before; new customer from this date.</span>
            </div>

            <div class="form-group">
              <label class="form-label">Reason</label>
              <input
                type="text"
                [(ngModel)]="transferReason"
                class="form-control"
                placeholder="e.g. Moved flat, sublet transfer"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showTransferModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="confirmTransfer()" [disabled]="transferringSub">
              {{ transferringSub ? 'Transferring...' : 'Confirm Transfer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Messy Data Import Modal (Twist 3: T4) ── -->
      <div class="modal-backdrop" *ngIf="showImportModal">
        <div class="modal-card modal-lg">
          <div class="modal-header">
            <h3>📥 Import Messy Customer Data (T4)</h3>
            <button class="modal-close" (click)="showImportModal = false">×</button>
          </div>
          <div class="modal-body">
            <p class="modal-intro">
              Handles duplicate phone numbers, messy formatting (+91, hyphens, spaces), mixed date formats (DD/MM/YYYY, YYYY-MM-DD, D-MMM-YYYY), and missing fields. Produces a clean &#123; imported, deduped, rejected &#125; breakdown report.
            </p>

            <div style="display: flex; gap: 0.75rem; margin-bottom: 0.75rem;">
              <button class="btn btn-outline btn-sm" (click)="loadSampleImport()">
                📋 Load Sample Messy JSON
              </button>
              <button class="btn btn-outline btn-sm" (click)="importJsonText = ''">
                Clear
              </button>
            </div>

            <div class="form-group">
              <label class="form-label">Messy JSON Input (Array of records)</label>
              <textarea
                [(ngModel)]="importJsonText"
                rows="7"
                class="form-control"
                style="font-family: monospace; font-size: 0.85rem;"
                placeholder='[ {"name": "Aarav", "phone": "+91-98765-43210", "plan": "STANDARD", "startDate": "15/09/2026"} ]'
              ></textarea>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <button class="btn btn-primary btn-block" (click)="runImport()" [disabled]="importingData">
                {{ importingData ? 'Processing & Cleaning...' : '🚀 Clean & Import Records' }}
              </button>
            </div>

            <!-- Import Report Result -->
            <div *ngIf="importReport" class="import-report-card">
              <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 1rem;">
                <div class="stat-card" style="padding: 0.75rem;">
                  <div class="stat-label">Total</div>
                  <div class="stat-value" style="font-size: 1.4rem;">{{ importReport.totalRecords }}</div>
                </div>
                <div class="stat-card" style="padding: 0.75rem; border-color: var(--success);">
                  <div class="stat-label" style="color: var(--success);">Imported</div>
                  <div class="stat-value" style="font-size: 1.4rem; color: var(--success);">{{ importReport.importedCount }}</div>
                </div>
                <div class="stat-card" style="padding: 0.75rem; border-color: #f59e0b;">
                  <div class="stat-label" style="color: #f59e0b;">Deduped</div>
                  <div class="stat-value" style="font-size: 1.4rem; color: #f59e0b;">{{ importReport.dedupedCount }}</div>
                </div>
                <div class="stat-card" style="padding: 0.75rem; border-color: var(--danger);">
                  <div class="stat-label" style="color: var(--danger);">Rejected</div>
                  <div class="stat-value" style="font-size: 1.4rem; color: var(--danger);">{{ importReport.rejectedCount }}</div>
                </div>
              </div>

              <!-- Details table -->
              <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Customer / Phone</th>
                      <th>Plan / Date</th>
                      <th>Detail / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of importReport.imported">
                      <td><span class="badge badge-active">IMPORTED</span></td>
                      <td>{{ item.name }} ({{ item.phone }})</td>
                      <td>{{ item.plan }} • {{ item.startDate }}</td>
                      <td class="text-success text-sm">Sub ID #{{ item.subscriptionId }} created</td>
                    </tr>
                    <tr *ngFor="let item of importReport.deduped">
                      <td><span class="badge" style="background: #fef3c7; color: #b45309;">DEDUPED</span></td>
                      <td>{{ item.name }} ({{ item.phone }})</td>
                      <td>{{ item.plan }}</td>
                      <td class="text-warning text-sm">{{ item.reason }}</td>
                    </tr>
                    <tr *ngFor="let item of importReport.rejected">
                      <td><span class="badge badge-paused">REJECTED</span></td>
                      <td>{{ item.name || '(Blank)' }} ({{ item.phone || '(Blank)' }})</td>
                      <td>{{ item.plan }}</td>
                      <td class="text-danger text-sm">{{ item.reason }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showImportModal = false">Close</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1240px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 1.5rem;
    }
    .role-indicator {
      display: inline-block;
      font-size: 0.725rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      background: var(--primary);
      color: white;
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-full);
      margin-bottom: 0.5rem;
    }
    .customer-tag {
      background: #0284c7;
    }
    .dash-title {
      font-size: 2rem;
      letter-spacing: -0.02em;
      margin-bottom: 0.25rem;
    }
    .dash-subtitle {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .dash-actions {
      display: flex;
      gap: 0.75rem;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }
    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .stat-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-icon {
      font-size: 1.25rem;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      font-family: 'Outfit', sans-serif;
      margin-bottom: 0.25rem;
    }
    .stat-sub {
      font-size: 0.8rem;
      color: var(--text-light);
    }
    .text-success { color: var(--success); }
    .text-warning { color: #d97706; }

    /* Toolbar */
    .toolbar-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);
    }
    .toolbar-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 2rem;
    }
    .toolbar-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.4rem;
      display: block;
    }
    .input-with-button { display: flex; gap: 0.5rem; }
    .filter-controls { display: flex; gap: 0.75rem; align-items: center; }
    .tabs {
      display: flex;
      background: var(--bg-subtle);
      border-radius: var(--radius-md);
      padding: 0.2rem;
    }
    .tab-btn {
      background: transparent;
      border: none;
      padding: 0.45rem 0.85rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.15s;
    }
    .tab-btn.active {
      background: #ffffff;
      color: var(--text-main);
      box-shadow: var(--shadow-sm);
    }
    .search-input { flex: 1; }

    /* Phone result card */
    .phone-result-card {
      margin-top: 1.25rem;
      padding: 1rem 1.25rem;
      background: var(--primary-50);
      border: 1px solid var(--primary-light);
      border-radius: var(--radius-md);
    }
    .phone-result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .result-badge {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      background: var(--primary);
      color: white;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
    }
    .phone-result-header h3 { font-size: 1.15rem; margin: 0.35rem 0 0.15rem; }
    .phone-result-header p { font-size: 0.85rem; color: var(--text-muted); }

    /* Table */
    .table-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .table-header h2 { font-size: 1.25rem; }
    .table-count { font-size: 0.85rem; color: var(--text-muted); }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th {
      background: var(--bg-subtle);
      padding: 0.85rem 1.25rem;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border);
    }
    .data-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.925rem;
    }
    .customer-info { display: flex; flex-direction: column; }
    .customer-name { font-weight: 700; color: var(--text-main); }
    .customer-phone { font-size: 0.8rem; color: var(--text-muted); }
    .plan-info { display: flex; align-items: center; gap: 0.5rem; }
    .plan-price { font-size: 0.85rem; color: var(--text-muted); }
    .pause-tag {
      font-size: 0.825rem;
      background: var(--warning-light);
      color: #92400e;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      font-weight: 600;
    }
    .actions-col { display: flex; gap: 0.5rem; justify-content: flex-end; }
    .text-right { text-align: right; }
    .btn-action-pause { color: #d97706; border-color: #fde68a; }
    .btn-action-pause:hover { background: #fef3c7; }
    .btn-action-resume { background: var(--success); }
    .btn-action-resume:hover { background: #059669; }
    .empty-state { text-align: center; padding: 3rem !important; color: var(--text-muted); }

    /* ========================================================================= */
    /* CUSTOMER PORTAL SPECIFIC STYLES                                           */
    /* ========================================================================= */
    .customer-sub-section {
      margin-bottom: 3rem;
    }
    .active-sub-card {
      border: 2px solid var(--border);
      padding: 2rem;
      background: #ffffff;
      box-shadow: var(--shadow-md);
    }
    .sub-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.75rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border);
    }
    .sub-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .sub-title-group h2 {
      font-size: 1.75rem;
      margin-top: 0.2rem;
    }
    .sub-card-body {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .sub-metric {
      display: flex;
      flex-direction: column;
      background: var(--bg-subtle);
      padding: 1.25rem;
      border-radius: var(--radius-md);
    }
    .metric-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.35rem;
    }
    .metric-value {
      font-size: 1.5rem;
      font-weight: 800;
      font-family: 'Outfit', sans-serif;
    }
    .schedule-text {
      font-size: 1.15rem;
      color: var(--primary);
    }
    .metric-note {
      font-size: 0.8rem;
      color: var(--text-light);
      margin-top: 0.25rem;
    }
    .sub-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border);
      font-size: 0.95rem;
    }
    .btn-warning-action {
      border-color: #f59e0b;
      color: #b45309;
    }
    .btn-warning-action:hover {
      background: #fef3c7;
    }
    .empty-sub-card {
      padding: 3rem 2rem;
      text-align: center;
      background: #ffffff;
      border: 2px dashed var(--border);
    }
    .empty-sub-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .empty-sub-card h3 {
      font-size: 1.35rem;
      margin-bottom: 0.5rem;
    }
    .empty-sub-card p {
      color: var(--text-muted);
      max-width: 540px;
      margin: 0 auto;
    }

    /* Providers Section */
    .providers-section, .invoices-section {
      margin-bottom: 3rem;
    }
    .section-title-box {
      margin-bottom: 1.5rem;
    }
    .section-title-box h2 {
      font-size: 1.5rem;
      letter-spacing: -0.01em;
      margin-bottom: 0.25rem;
    }
    .section-title-box p {
      color: var(--text-muted);
      font-size: 0.925rem;
    }
    .providers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 1.75rem;
    }
    .provider-card {
      padding: 1.75rem;
      position: relative;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
    }
    .provider-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 0.725rem;
      font-weight: 700;
      color: var(--success);
      background: var(--success-light);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
    }
    .provider-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .kitchen-avatar {
      width: 48px;
      height: 48px;
      background: #ffedd5;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .kitchen-name {
      font-size: 1.25rem;
    }
    .kitchen-contact {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .menu-tiers {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      margin-bottom: 1.75rem;
    }
    .menu-tier {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.65rem 0.85rem;
      background: var(--bg-main);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      font-size: 0.875rem;
    }
    .featured-tier {
      background: var(--primary-50);
      border-color: var(--primary-light);
    }
    .tier-name { font-weight: 700; }
    .tier-desc { font-size: 0.775rem; color: var(--text-muted); }
    .tier-price { font-weight: 800; font-family: 'Outfit', sans-serif; }
    .tier-price span { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
    .provider-footer { margin-top: auto; }
    .btn-block { width: 100%; }

    /* Modals */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1.5rem;
    }
    .modal-card {
      background: #ffffff;
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 520px;
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
    }
    .modal-lg { max-width: 900px; }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-muted);
    }
    .modal-body { padding: 1.5rem; max-height: 70vh; overflow-y: auto; }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      background: var(--bg-main);
      border-bottom-left-radius: var(--radius-xl);
      border-bottom-right-radius: var(--radius-xl);
    }
    .modal-intro { font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1.25rem; }
    .billing-controls {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 1rem;
      align-items: flex-end;
      margin-bottom: 1.5rem;
    }
    .final-bill-amount { font-size: 1.1rem; font-weight: 800; color: var(--success); }
    .billing-explainer {
      margin-top: 1.25rem;
      padding: 0.85rem 1rem;
      background: var(--bg-subtle);
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .close-alert { float: right; background: none; border: none; font-size: 1.1rem; cursor: pointer; }

    @media (max-width: 900px) {
      .stats-grid, .sub-card-body { grid-template-columns: 1fr; }
      .toolbar-grid { grid-template-columns: 1fr; }
      .dash-header { flex-direction: column; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  isOwner = false;
  currentUser: any = null;

  // Owner data
  stats: DashboardStats | null = null;
  subscriptions: any[] = [];
  filteredSubscriptions: any[] = [];
  customersList: any[] = [];

  // Customer data
  mySubscription: any = null;
  tiffinProviders: User[] = [];
  myInvoices: any[] = [];

  // Filter state
  selectedStatus = 'ALL';
  searchQuery = '';
  searchPhone = '';
  lookupResult: User | null = null;

  // Alerts
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';

  // Pause Modal
  showPauseModal = false;
  targetSubscription: any = null;
  pauseReason = '';

  // Billing Modal (Owner)
  showBillingModal = false;
  billingMonth = new Date().getMonth() + 1;
  billingYear = new Date().getFullYear();
  invoices: any[] = [];
  calculatingBill = false;

  // New Sub Modal
  showNewSubModal = false;
  newSubCustomerId: number | null = null;
  newSubPlan = 'STANDARD';

  // Twist 1: Clock & Outbox (T1)
  showClockModal = false;
  clockDate = new Date().toISOString().substring(0, 10);
  tickingClock = false;
  loadingOutbox = false;
  clockResult: any = null;
  outboxMessages: any[] = [];

  // Twist 2: Subscription Transfer (T6)
  showTransferModal = false;
  subToTransfer: any = null;
  transferPhone = '';
  transferName = '';
  transferDate = new Date().toISOString().substring(0, 10);
  transferReason = 'Sublet / customer transfer';
  transferringSub = false;

  // Twist 3: Messy Data Import (T4)
  showImportModal = false;
  importJsonText = '';
  importingData = false;
  importReport: any = null;

  constructor(
    private tiffinService: TiffinService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isOwner = this.authService.isOwner();

    if (this.isOwner) {
      this.loadStats();
      this.loadSubscriptions();
      this.loadCustomers();
    } else {
      this.loadCustomerData();
      this.loadTiffinProviders();
    }
  }

  // ── Owner Methods ──

  loadStats(): void {
    this.tiffinService.getDashboardStats().subscribe({
      next: (res) => this.stats = res,
      error: (err) => console.error('Error fetching stats', err)
    });
  }

  loadSubscriptions(): void {
    this.tiffinService.getAllSubscriptions().subscribe({
      next: (res) => {
        this.subscriptions = res;
        this.applyLocalFilter();
      },
      error: () => this.showAlert('Error loading subscriptions', 'error')
    });
  }

  loadCustomers(): void {
    this.tiffinService.listCustomers(0, 50).subscribe({
      next: (res) => {
        this.customersList = res.content || [];
      },
      error: (err) => console.error('Error fetching customers', err)
    });
  }

  applyLocalFilter(): void {
    let list = [...this.subscriptions];
    if (this.selectedStatus !== 'ALL') {
      list = list.filter(s => s.status === this.selectedStatus);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(s =>
        s.customer?.name?.toLowerCase().includes(q) ||
        s.customer?.phone?.includes(q) ||
        s.planName?.toLowerCase().includes(q)
      );
    }
    this.filteredSubscriptions = list;
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.applyLocalFilter();
  }

  countStatus(status: string): number {
    return this.subscriptions.filter(s => s.status === status).length;
  }

  lookupByPhone(): void {
    if (!this.searchPhone.trim()) {
      this.lookupResult = null;
      return;
    }
    this.tiffinService.searchByPhone(this.searchPhone.trim()).subscribe({
      next: (customer) => {
        this.lookupResult = customer;
        this.searchQuery = customer.phone;
        this.applyLocalFilter();
      },
      error: () => {
        this.showAlert(`No customer found with phone: ${this.searchPhone}`, 'error');
        this.lookupResult = null;
      }
    });
  }

  // ── Customer Methods ──

  loadCustomerData(): void {
    this.tiffinService.getMySubscriptions().subscribe({
      next: (subs) => {
        // Look for active or paused subscription
        const current = subs.find(s => s.status === 'ACTIVE' || s.status === 'PAUSED');
        this.mySubscription = current || (subs.length > 0 ? subs[0] : null);
      },
      error: (err) => console.error('Error fetching my subscriptions', err)
    });

    this.tiffinService.getMyInvoices().subscribe({
      next: (res) => {
        this.myInvoices = res.content || [];
      },
      error: (err) => console.error('Error fetching my invoices', err)
    });
  }

  loadTiffinProviders(): void {
    this.tiffinService.getAvailableTiffinServices().subscribe({
      next: (providers) => {
        this.tiffinProviders = providers;
      },
      error: (err) => console.error('Error fetching tiffin providers', err)
    });
  }

  subscribeToKitchen(provider: User): void {
    if (this.mySubscription && this.mySubscription.status !== 'CANCELLED') {
      this.showAlert(`You already have an active subscription (${this.mySubscription.planName}). Please cancel it before subscribing to a new kitchen.`, 'error');
      return;
    }
    this.newSubCustomerId = this.currentUser?.userId || this.currentUser?.id;
    this.showNewSubModal = true;
  }

  // ── Shared Pause & Resume ──

  openPauseModal(sub: any): void {
    this.targetSubscription = sub;
    this.pauseReason = '';
    this.showPauseModal = true;
  }

  confirmPause(): void {
    if (!this.targetSubscription) return;
    this.tiffinService.pauseSubscription(this.targetSubscription.id, this.pauseReason).subscribe({
      next: () => {
        this.showPauseModal = false;
        this.showAlert('Deliveries paused successfully. You will not be charged for paused weekdays.');
        if (this.isOwner) {
          this.loadSubscriptions();
          this.loadStats();
        } else {
          this.loadCustomerData();
        }
      },
      error: (err) => this.showAlert(err.error?.message || 'Failed to pause subscription', 'error')
    });
  }

  resumeSubscription(sub: any): void {
    this.tiffinService.resumeSubscription(sub.id).subscribe({
      next: () => {
        this.showAlert('Deliveries resumed successfully! Meals scheduled for upcoming weekdays.');
        if (this.isOwner) {
          this.loadSubscriptions();
          this.loadStats();
        } else {
          this.loadCustomerData();
        }
      },
      error: (err) => this.showAlert(err.error?.message || 'Failed to resume subscription', 'error')
    });
  }

  // ── Billing (Owner) ──

  openBillingModal(): void {
    this.showBillingModal = true;
    this.generateInvoices();
  }

  openSubBilling(sub: any): void {
    this.showBillingModal = true;
    this.generateInvoices();
  }

  generateInvoices(): void {
    this.calculatingBill = true;
    this.tiffinService.generateInvoices(this.billingMonth, this.billingYear).subscribe({
      next: (res) => {
        this.invoices = res;
        this.calculatingBill = false;
      },
      error: (err) => {
        this.calculatingBill = false;
        this.showAlert(err.error?.message || 'Error generating invoices', 'error');
      }
    });
  }

  // ── New Subscription ──

  openNewSubModal(): void {
    this.showNewSubModal = true;
  }

  createSubscription(): void {
    const custId = this.isOwner ? this.newSubCustomerId : (this.currentUser?.userId || this.currentUser?.id);
    if (!custId) {
      this.showAlert('Please select a customer', 'error');
      return;
    }
    this.tiffinService.createSubscription({
      customerId: custId,
      planName: this.newSubPlan
    }).subscribe({
      next: () => {
        this.showNewSubModal = false;
        this.showAlert('Subscription created successfully!');
        if (this.isOwner) {
          this.loadSubscriptions();
          this.loadStats();
        } else {
          this.loadCustomerData();
        }
      },
      error: (err) => this.showAlert(err.error?.message || 'Failed to create subscription', 'error')
    });
  }

  // ── Twist 1: Clock & Outbox (T1) Methods ──

  openClockModal(): void {
    this.showClockModal = true;
    this.loadOutbox();
  }

  tickClock(): void {
    if (!this.clockDate) {
      this.showAlert('Please select a date', 'error');
      return;
    }
    this.tickingClock = true;
    this.tiffinService.tickClock(this.clockDate).subscribe({
      next: (res) => {
        this.tickingClock = false;
        this.clockResult = res;
        this.showAlert(res.message);
        this.loadOutbox();
        this.loadStats();
      },
      error: (err) => {
        this.tickingClock = false;
        this.showAlert(err.error?.message || 'Failed to tick clock', 'error');
      }
    });
  }

  loadOutbox(): void {
    this.loadingOutbox = true;
    this.tiffinService.getOutbox().subscribe({
      next: (res) => {
        this.outboxMessages = res;
        this.loadingOutbox = false;
      },
      error: () => {
        this.loadingOutbox = false;
      }
    });
  }

  // ── Twist 2: Subscription Transfer (T6) Methods ──

  openTransferModal(sub: any): void {
    this.subToTransfer = sub;
    this.transferPhone = '';
    this.transferName = '';
    this.transferDate = new Date().toISOString().substring(0, 10);
    this.transferReason = 'Sublet / customer transfer';
    this.showTransferModal = true;
  }

  confirmTransfer(): void {
    if (!this.subToTransfer) return;
    if (!this.transferPhone || !this.transferDate) {
      this.showAlert('Please provide both new customer phone and transfer date', 'error');
      return;
    }

    this.transferringSub = true;
    this.tiffinService.transferSubscription(this.subToTransfer.id, {
      targetPhone: this.transferPhone.trim(),
      transferDate: this.transferDate,
      reason: this.transferReason?.trim() || undefined
    }).subscribe({
      next: (res) => {
        this.transferringSub = false;
        this.showTransferModal = false;
        this.showAlert('Subscription transferred successfully! Plan carried over and billing cycle split.');
        this.loadSubscriptions();
        this.loadStats();
        this.loadCustomers();
      },
      error: (err) => {
        this.transferringSub = false;
        this.showAlert(err.error?.message || 'Failed to transfer subscription', 'error');
      }
    });
  }

  // ── Twist 3: Messy Data Import (T4) Methods ──

  openImportModal(): void {
    this.showImportModal = true;
    if (!this.importJsonText) {
      this.loadSampleImport();
    }
  }

  loadSampleImport(): void {
    this.importJsonText = JSON.stringify([
      { "name": "Karan Malhotra", "phone": "+91-98765-11223", "plan": "PREMIUM", "startDate": "01/09/2026" },
      { "name": "Simran Kaur", "phone": "98765 11223", "plan": "STANDARD", "startDate": "2026-09-05" },
      { "name": "Devansh Patel", "phone": "9988776655", "plan": "BASIC", "startDate": "10-Sep-2026" },
      { "name": "", "phone": "12345", "plan": "STANDARD", "startDate": "2026-09-01" },
      { "name": "Pooja Hegde", "phone": "9123456780", "plan": "INVALID_PLAN", "startDate": "invalid-date" }
    ], null, 2);
  }

  runImport(): void {
    if (!this.importJsonText?.trim()) {
      this.showAlert('Please paste JSON data to import', 'error');
      return;
    }

    let records: any[];
    try {
      records = JSON.parse(this.importJsonText);
      if (!Array.isArray(records)) {
        this.showAlert('Input JSON must be an array of records [ {...}, {...} ]', 'error');
        return;
      }
    } catch (e: any) {
      this.showAlert('Invalid JSON format: ' + e.message, 'error');
      return;
    }

    this.importingData = true;
    this.tiffinService.importCustomers(records).subscribe({
      next: (report) => {
        this.importingData = false;
        this.importReport = report;
        this.showAlert(`Import complete: ${report.importedCount} imported, ${report.dedupedCount} deduped, ${report.rejectedCount} rejected.`);
        this.loadCustomers();
        this.loadSubscriptions();
        this.loadStats();
      },
      error: (err) => {
        this.importingData = false;
        this.showAlert(err.error?.message || 'Failed to process import', 'error');
      }
    });
  }

  private showAlert(msg: string, type: 'success' | 'error' = 'success'): void {
    this.alertMessage = msg;
    this.alertType = type;
    setTimeout(() => {
      if (this.alertMessage === msg) {
        this.alertMessage = '';
      }
    }, 4000);
  }
}
