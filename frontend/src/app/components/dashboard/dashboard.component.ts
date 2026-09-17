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
      <!-- Top Welcome Banner -->
      <header class="dash-header">
        <div>
          <h1 class="dash-title">Tiffin Operations & Billing</h1>
          <p class="dash-subtitle">Track active weekday deliveries, manage customer pauses, and generate pro-rated month-end invoices.</p>
        </div>
        <div class="dash-actions">
          <button class="btn btn-outline" (click)="openBillingModal()">
            🧮 Monthly Invoices
          </button>
          <button class="btn btn-primary" (click)="openNewSubModal()">
            + New Subscription
          </button>
        </div>
      </header>

      <!-- Alert Banner -->
      <div *ngIf="alertMessage" class="alert" [ngClass]="alertType === 'error' ? 'alert-danger' : 'alert-success'">
        {{ alertMessage }}
        <button class="close-alert" (click)="alertMessage = ''">×</button>
      </div>

      <!-- Stats Grid -->
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

      <!-- Lookup by Phone & Search Toolbar -->
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

        <!-- Phone Lookup Result Banner if found -->
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

      <!-- Subscriptions Table -->
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
                  <!-- Pause Button if ACTIVE -->
                  <button
                    *ngIf="sub.status === 'ACTIVE'"
                    class="btn btn-outline btn-sm btn-action-pause"
                    (click)="openPauseModal(sub)"
                  >
                    ⏸️ Pause
                  </button>

                  <!-- Resume Button if PAUSED -->
                  <button
                    *ngIf="sub.status === 'PAUSED'"
                    class="btn btn-primary btn-sm btn-action-resume"
                    (click)="resumeSubscription(sub)"
                  >
                    ▶️ Resume
                  </button>

                  <!-- Pro-rate / Billing -->
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
                  <div class="empty-box">
                    <p>No subscriptions match your search or filter.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ── Pause Modal ── -->
      <div class="modal-backdrop" *ngIf="showPauseModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Pause Subscription</h3>
            <button class="modal-close" (click)="showPauseModal = false">×</button>
          </div>
          <div class="modal-body">
            <p class="modal-intro">
              Pause deliveries for <strong>{{ targetSubscription?.customer?.name }}</strong>.
              Paused weekdays will not be billed.
            </p>
            <div class="form-group">
              <label class="form-label">Reason (optional)</label>
              <input
                type="text"
                [(ngModel)]="pauseReason"
                class="form-control"
                placeholder="e.g. Vacation, Visiting hometown, Festival"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showPauseModal = false">Cancel</button>
            <button class="btn btn-warning" (click)="confirmPause()">Confirm Pause</button>
          </div>
        </div>
      </div>

      <!-- ── Pro-Rated Bill Calculator Modal ── -->
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
            <h3>Create New Subscription</h3>
            <button class="modal-close" (click)="showNewSubModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Select Customer</label>
              <select [(ngModel)]="newSubCustomerId" class="form-control">
                <option [ngValue]="null">-- Choose Customer --</option>
                <option *ngFor="let c of customersList" [ngValue]="c.id">
                  {{ c.name }} ({{ c.phone }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Select Plan</label>
              <select [(ngModel)]="newSubPlan" class="form-control">
                <option value="BASIC">Basic Tiffin (₹2,000/mo)</option>
                <option value="STANDARD">Standard Tiffin (₹3,000/mo)</option>
                <option value="PREMIUM">Premium Feast (₹4,500/mo)</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="showNewSubModal = false">Cancel</button>
            <button class="btn btn-primary" [disabled]="!newSubCustomerId" (click)="createSubscription()">
              Create Subscription
            </button>
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
    .text-success {
      color: var(--success);
    }
    .text-warning {
      color: #d97706;
    }

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
    .input-with-button {
      display: flex;
      gap: 0.5rem;
    }
    .filter-controls {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
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
    .search-input {
      flex: 1;
    }

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
    .phone-result-header h3 {
      font-size: 1.15rem;
      margin: 0.35rem 0 0.15rem;
    }
    .phone-result-header p {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

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
    .table-header h2 {
      font-size: 1.25rem;
    }
    .table-count {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
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
    .customer-info {
      display: flex;
      flex-direction: column;
    }
    .customer-name {
      font-weight: 700;
      color: var(--text-main);
    }
    .customer-phone {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .plan-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .plan-price {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .pause-tag {
      font-size: 0.825rem;
      background: var(--warning-light);
      color: #92400e;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      font-weight: 600;
    }
    .actions-col {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }
    .text-right {
      text-align: right;
    }
    .btn-action-pause {
      color: #d97706;
      border-color: #fde68a;
    }
    .btn-action-pause:hover {
      background: #fef3c7;
    }
    .btn-action-resume {
      background: var(--success);
    }
    .btn-action-resume:hover {
      background: #059669;
    }
    .empty-state {
      text-align: center;
      padding: 3rem !important;
      color: var(--text-muted);
    }

    /* Modal Styles */
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
    .modal-lg {
      max-width: 900px;
    }
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
    .modal-body {
      padding: 1.5rem;
      max-height: 70vh;
      overflow-y: auto;
    }
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
    .modal-intro {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
    }
    .billing-controls {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 1rem;
      align-items: flex-end;
      margin-bottom: 1.5rem;
    }
    .final-bill-amount {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--success);
    }
    .billing-explainer {
      margin-top: 1.25rem;
      padding: 0.85rem 1rem;
      background: var(--bg-subtle);
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .close-alert {
      float: right;
      background: none;
      border: none;
      font-size: 1.1rem;
      cursor: pointer;
    }

    @media (max-width: 900px) {
      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }
      .toolbar-grid {
        grid-template-columns: 1fr;
      }
      .dash-header {
        flex-direction: column;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  subscriptions: any[] = [];
  filteredSubscriptions: any[] = [];
  customersList: any[] = [];

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

  // Billing Modal
  showBillingModal = false;
  billingMonth = new Date().getMonth() + 1; // 1-indexed
  billingYear = new Date().getFullYear();
  invoices: any[] = [];
  calculatingBill = false;

  // New Sub Modal
  showNewSubModal = false;
  newSubCustomerId: number | null = null;
  newSubPlan = 'STANDARD';

  constructor(
    private tiffinService: TiffinService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadSubscriptions();
    this.loadCustomers();
  }

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
      error: (err) => this.showAlert('Error loading subscriptions', 'error')
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

  // Pause
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
        this.showAlert(`Subscription for ${this.targetSubscription.customer?.name} paused successfully.`);
        this.loadSubscriptions();
        this.loadStats();
      },
      error: (err) => this.showAlert(err.error?.message || 'Failed to pause subscription', 'error')
    });
  }

  // Resume
  resumeSubscription(sub: any): void {
    this.tiffinService.resumeSubscription(sub.id).subscribe({
      next: () => {
        this.showAlert(`Subscription for ${sub.customer?.name} resumed successfully!`);
        this.loadSubscriptions();
        this.loadStats();
      },
      error: (err) => this.showAlert(err.error?.message || 'Failed to resume subscription', 'error')
    });
  }

  // Billing
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

  // New Subscription
  openNewSubModal(): void {
    this.showNewSubModal = true;
  }

  createSubscription(): void {
    if (!this.newSubCustomerId) return;
    this.tiffinService.createSubscription({
      customerId: this.newSubCustomerId,
      planName: this.newSubPlan
    }).subscribe({
      next: () => {
        this.showNewSubModal = false;
        this.showAlert('Subscription created successfully!');
        this.loadSubscriptions();
        this.loadStats();
      },
      error: (err) => this.showAlert(err.error?.message || 'Failed to create subscription', 'error')
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
