import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container hero-grid">
          <div class="hero-content">
            <div class="hero-pill">
              <span class="pill-spark">✨</span>
              <span>Smart Lunch Subscriptions</span>
            </div>
            <h1 class="hero-title">
              Home-style lunch delivery with <span class="highlight">fair pro-rated</span> billing.
            </h1>
            <p class="hero-subtitle">
              Subscribe to healthy, fresh weekday lunches. Need to travel or attend festivals? Pause deliveries with 1 click and never pay for meals you didn't receive.
            </p>
            <div class="hero-cta">
              <a routerLink="/register" class="btn btn-primary btn-lg">Start Subscription</a>
              <a routerLink="/login" class="btn btn-outline btn-lg">Owner Sign In →</a>
            </div>
            <div class="hero-trust">
              <div class="trust-item">
                <strong>₹0</strong> wasted on pause days
              </div>
              <div class="trust-dot">•</div>
              <div class="trust-item">
                <strong>Mon–Fri</strong> weekday delivery
              </div>
              <div class="trust-dot">•</div>
              <div class="trust-item">
                <strong>Instant</strong> phone lookup
              </div>
            </div>
          </div>

          <div class="hero-card-preview">
            <div class="preview-card">
              <div class="preview-header">
                <div class="preview-badge">Live Pro-Rate Calculation</div>
                <span class="preview-tag">September 2026</span>
              </div>
              <div class="preview-customer">
                <div class="avatar">AD</div>
                <div>
                  <h4>Anita Desai</h4>
                  <p>+91 98765 43211 • Premium Plan</p>
                </div>
              </div>
              <div class="breakdown-box">
                <div class="breakdown-row">
                  <span>Standard Plan (22 Weekdays)</span>
                  <strong>₹4,500.00</strong>
                </div>
                <div class="breakdown-row paused-row">
                  <span>Paused: Sep 08 – End (17 Days)</span>
                  <span class="discount">- ₹3,477.27</span>
                </div>
                <div class="divider"></div>
                <div class="breakdown-row total-row">
                  <span>Final Month Bill (5 Delivered Days)</span>
                  <span class="final-price">₹1,022.73</span>
                </div>
              </div>
              <div class="preview-footer">
                <span class="status-indicator active-dot"></span>
                <span>Billed accurately only for delivered weekdays</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Features Section -->
      <section class="features-section">
        <div class="container">
          <div class="section-heading">
            <h2 class="section-title">Built for Home Chefs & Hungry Professionals</h2>
            <p class="section-desc">Everything needed to run a stress-free tiffin service with zero manual billing disputes.</p>
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">⏸️</div>
              <h3>Pause & Resume Anytime</h3>
              <p>Customers can pause their tiffins during holidays, vacations, or sick days. Resume anytime with zero hassle.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🧮</div>
              <h3>Fair Pro-Rated Billing</h3>
              <p>Monthly fee is divided only across scheduled weekdays. Paused days are automatically deducted at month-end.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">📱</div>
              <h3>Fast Phone Lookups</h3>
              <p>Search any customer instantly by phone number. Instantly check who is active today versus who is paused.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🍲</div>
              <h3>Weekday Meals Focus</h3>
              <p>Designed specifically for Monday-to-Friday workweek deliveries, eliminating complex weekend confusion.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-section">
        <div class="container">
          <div class="section-heading">
            <h2 class="section-title">How It Works in 3 Simple Steps</h2>
          </div>

          <div class="steps-grid">
            <div class="step-card">
              <div class="step-num">1</div>
              <h3>Subscribe to a Plan</h3>
              <p>Choose Basic (2 rotis + sabzi), Standard (+ dal/rice), or Premium (+ sweet & salad) for weekday lunch.</p>
            </div>

            <div class="step-card">
              <div class="step-num">2</div>
              <h3>Life Happens? Hit Pause</h3>
              <p>Traveling or taking a day off? Tell the tiffin owner or pause your subscription with custom dates.</p>
            </div>

            <div class="step-card">
              <div class="step-num">3</div>
              <h3>Auto-Calculated Bill</h3>
              <p>At month-end, the system tallies actual delivered meals. Transparent breakdown with zero spreadsheets.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Plans -->
      <section class="pricing-section">
        <div class="container">
          <div class="section-heading">
            <h2 class="section-title">Transparent Meal Plans</h2>
            <p class="section-desc">Flexible monthly subscriptions for office goers, students, and families.</p>
          </div>

          <div class="pricing-grid">
            <div class="plan-card">
              <div class="plan-header">
                <h3>Basic Tiffin</h3>
                <p class="plan-subtitle">Light & wholesome daily lunch</p>
                <div class="plan-price">
                  <span class="currency">₹</span>
                  <span class="amount">2,000</span>
                  <span class="period">/month</span>
                </div>
              </div>
              <ul class="plan-features">
                <li>✓ 4 Rotis, Seasonal Sabzi</li>
                <li>✓ Mon-Fri Delivery</li>
                <li>✓ Pause anytime</li>
                <li>✓ Pro-rated billing</li>
              </ul>
              <a routerLink="/register" class="btn btn-outline btn-block">Choose Basic</a>
            </div>

            <div class="plan-card featured-plan">
              <div class="popular-badge">Most Popular</div>
              <div class="plan-header">
                <h3>Standard Tiffin</h3>
                <p class="plan-subtitle">The complete balanced lunch</p>
                <div class="plan-price">
                  <span class="currency">₹</span>
                  <span class="amount">3,000</span>
                  <span class="period">/month</span>
                </div>
              </div>
              <ul class="plan-features">
                <li>✓ 4 Rotis, Sabzi, Dal & Rice</li>
                <li>✓ Fresh Salad & Pickle</li>
                <li>✓ Mon-Fri Delivery</li>
                <li>✓ Pause anytime</li>
                <li>✓ Pro-rated billing</li>
              </ul>
              <a routerLink="/register" class="btn btn-primary btn-block">Choose Standard</a>
            </div>

            <div class="plan-card">
              <div class="plan-header">
                <h3>Premium Feast</h3>
                <p class="plan-subtitle">Gourmet homemade variety</p>
                <div class="plan-price">
                  <span class="currency">₹</span>
                  <span class="amount">4,500</span>
                  <span class="period">/month</span>
                </div>
              </div>
              <ul class="plan-features">
                <li>✓ Rotis, 2 Sabzis, Dal, Rice</li>
                <li>✓ Dessert/Sweet & Buttermilk</li>
                <li>✓ Priority Delivery Slot</li>
                <li>✓ Pause anytime</li>
                <li>✓ Pro-rated billing</li>
              </ul>
              <a routerLink="/register" class="btn btn-outline btn-block">Choose Premium</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer CTA -->
      <section class="cta-banner">
        <div class="container text-center">
          <h2>Ready to streamline your tiffin business?</h2>
          <p>Join home chefs and tiffin services managing hundreds of satisfied customers.</p>
          <div class="cta-buttons">
            <a routerLink="/register" class="btn btn-primary btn-lg">Get Started Free</a>
            <a routerLink="/login" class="btn btn-outline btn-lg cta-login">Owner Portal</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }
    .hero-section {
      padding: 4.5rem 0 5rem;
      background: radial-gradient(circle at 10% 20%, rgba(249, 115, 22, 0.08) 0%, rgba(255, 255, 255, 0) 60%);
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 3.5rem;
      align-items: center;
    }
    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--primary-50);
      color: var(--primary-hover);
      border: 1px solid var(--primary-light);
      padding: 0.35rem 0.9rem;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
    }
    .hero-title {
      font-size: 3.25rem;
      line-height: 1.15;
      margin-bottom: 1.25rem;
      letter-spacing: -0.03em;
    }
    .highlight {
      color: var(--primary);
    }
    .hero-subtitle {
      font-size: 1.15rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .hero-cta {
      display: flex;
      gap: 1rem;
      margin-bottom: 2.25rem;
    }
    .hero-trust {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .trust-item strong {
      color: var(--text-main);
    }
    .trust-dot {
      color: var(--border);
    }

    /* Hero Card Preview */
    .preview-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 1.75rem;
      box-shadow: var(--shadow-xl);
    }
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .preview-badge {
      background: var(--primary-50);
      color: var(--primary);
      padding: 0.3rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .preview-tag {
      font-size: 0.825rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .preview-customer {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 1.5rem;
    }
    .avatar {
      width: 44px;
      height: 44px;
      background: #fed7aa;
      color: #9a3412;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .preview-customer h4 {
      font-size: 1.05rem;
    }
    .preview-customer p {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .breakdown-box {
      background: var(--bg-subtle);
      border-radius: var(--radius-md);
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .breakdown-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    .paused-row {
      color: #b45309;
    }
    .discount {
      font-weight: 700;
      color: #d97706;
    }
    .divider {
      height: 1px;
      background: var(--border);
      margin: 0.25rem 0;
    }
    .total-row {
      font-weight: 700;
      font-size: 0.95rem;
    }
    .final-price {
      font-size: 1.25rem;
      color: var(--success);
      font-weight: 800;
    }
    .preview-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.25rem;
      font-size: 0.825rem;
      color: var(--text-muted);
    }
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
    }

    /* Features */
    .features-section, .how-section, .pricing-section {
      padding: 5rem 0;
    }
    .features-section {
      background: #ffffff;
    }
    .section-heading {
      text-align: center;
      max-width: 680px;
      margin: 0 auto 3.5rem;
    }
    .section-title {
      font-size: 2.25rem;
      margin-bottom: 0.85rem;
      letter-spacing: -0.02em;
    }
    .section-desc {
      font-size: 1.05rem;
      color: var(--text-muted);
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 2rem;
    }
    .feature-card {
      padding: 2rem;
      border-radius: var(--radius-lg);
      background: var(--bg-main);
      border: 1px solid var(--border);
    }
    .feature-icon {
      font-size: 2.25rem;
      margin-bottom: 1rem;
    }
    .feature-card h3 {
      font-size: 1.2rem;
      margin-bottom: 0.65rem;
    }
    .feature-card p {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    /* Steps */
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2.5rem;
    }
    .step-card {
      background: #ffffff;
      padding: 2rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      position: relative;
    }
    .step-num {
      width: 44px;
      height: 44px;
      background: var(--primary);
      color: white;
      font-size: 1.25rem;
      font-weight: 800;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }
    .step-card h3 {
      margin-bottom: 0.65rem;
      font-size: 1.25rem;
    }
    .step-card p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    /* Pricing */
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      align-items: center;
    }
    .plan-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 2.25rem;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .featured-plan {
      border: 2px solid var(--primary);
      box-shadow: var(--shadow-lg);
      transform: scale(1.03);
    }
    .popular-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.25rem 0.85rem;
      border-radius: var(--radius-full);
      letter-spacing: 0.05em;
    }
    .plan-header h3 {
      font-size: 1.5rem;
      margin-bottom: 0.25rem;
    }
    .plan-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }
    .plan-price {
      display: flex;
      align-items: baseline;
      margin-bottom: 1.75rem;
    }
    .plan-price .currency {
      font-size: 1.5rem;
      font-weight: 700;
    }
    .plan-price .amount {
      font-size: 2.75rem;
      font-weight: 800;
      font-family: 'Outfit', sans-serif;
      margin: 0 0.2rem;
    }
    .plan-price .period {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .plan-features {
      list-style: none;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      font-size: 0.925rem;
    }
    .plan-features li {
      color: var(--text-main);
    }
    .btn-block {
      width: 100%;
    }

    /* CTA Banner */
    .cta-banner {
      background: var(--secondary);
      color: #ffffff;
      padding: 4.5rem 0;
    }
    .cta-banner h2 {
      color: #ffffff;
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }
    .cta-banner p {
      color: #94a3b8;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }
    .text-center {
      text-align: center;
    }
    .cta-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
    .cta-login {
      border-color: #334155;
      color: #ffffff;
    }
    .cta-login:hover {
      background: #1e293b;
    }

    @media (max-width: 900px) {
      .hero-grid, .steps-grid, .pricing-grid {
        grid-template-columns: 1fr;
      }
      .featured-plan {
        transform: none;
      }
    }
  `]
})
export class LandingComponent {}
