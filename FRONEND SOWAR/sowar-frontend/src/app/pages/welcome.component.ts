import { Component, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-welcome',
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="welcome-container">
      <!-- Language Switcher in Welcome Page -->
      <div class="welcome-lang-switcher-single">
        @if (translate.currentLang() === 'ar' || !translate.currentLang()) {
          <button type="button" class="lang-toggle-btn" (click)="switchLanguage('en')">EN</button>
        } @else {
          <button type="button" class="lang-toggle-btn" (click)="switchLanguage('ar')">AR</button>
        }
      </div>

      <!-- Floating Honey Droplets -->
      <div class="droplets">
        <div class="drop drop-1"></div>
        <div class="drop drop-2"></div>
        <div class="drop drop-3"></div>
        <div class="drop drop-4"></div>
      </div>

      <div class="welcome-content">
        <div class="brand-section">
          <h1 class="welcome-brand">SOWAR</h1>
          <div class="welcome-divider"></div>
          <p class="welcome-subtitle">{{ 'Pure Golden Nectar' | translate }}</p>
        </div>
        
        <div class="gallery-honeycomb">
          <div class="hexagon hex-1">
            <img src="/user-honey.jpg" alt="Pure Honey">
            <div class="hex-overlay"></div>
          </div>
          <div class="hexagon hex-2">
            <img src="https://unsplash.com/photos/nesUgwNX3u4/download" alt="Honey Dipper">
            <div class="hex-overlay"></div>
          </div>
          <div class="hexagon hex-3">
            <img src="/organic-honey.png" alt="Organic Honey">
            <div class="hex-overlay"></div>
          </div>
        </div>

        <div class="welcome-actions">
          <a routerLink="/home" class="enter-btn">
            <span class="btn-text">{{ 'ENTER STORE' | translate }}</span>
            <div class="btn-liquid"></div>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container {
      min-height: 100vh;
      width: 100vw;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 99999;
      background: #090704;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-family: var(--font-body);
    }

    .welcome-lang-switcher-single {
      position: absolute;
      top: 30px;
      inset-inline-end: 30px;
      z-index: 100000;
      display: inline-flex;
    }
    .lang-toggle-btn {
      height: 38px;
      padding: 0 16px;
      font-size: 0.85rem;
      font-weight: 800;
      border: 1px solid rgba(212, 163, 92, 0.3);
      border-radius: 19px;
      color: var(--accent-primary);
      background: rgba(255, 255, 255, 0.03);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .lang-toggle-btn:hover {
      color: #0c0906;
      background: var(--accent-primary);
      border-color: var(--accent-primary);
      box-shadow: 0 0 15px rgba(212, 163, 92, 0.5);
      transform: translateY(-2px);
    }

    /* 🍯 Floating Honey Droplets (Blur Blobs) */
    .droplets {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
    }
    .drop {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(212, 163, 92, 0.25) 0%, rgba(163, 115, 54, 0) 70%);
      filter: blur(40px);
      animation: float 12s ease-in-out infinite alternate;
    }
    .drop-1 { width: 400px; height: 400px; top: -10%; left: -5%; animation-duration: 16s; }
    .drop-2 { width: 500px; height: 500px; bottom: -15%; right: -5%; animation-duration: 20s; }
    .drop-3 { width: 300px; height: 300px; top: 40%; right: 20%; animation-duration: 14s; animation-delay: -3s; }
    .drop-4 { width: 350px; height: 350px; bottom: 20%; left: 15%; animation-duration: 18s; animation-delay: -5s; }

    @keyframes float {
      0% { transform: translateY(0) scale(1); }
      100% { transform: translateY(-40px) scale(1.15); }
    }

    /* 💎 Welcome Content Layout */
    .welcome-content {
      position: relative;
      z-index: 2;
      width: min(1200px, 90vw);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-3xl);
      text-align: center;
    }

    /* Brand Section */
    .brand-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      animation: slideDown 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    .welcome-brand {
      font-family: var(--font-title);
      font-size: clamp(3rem, 8vw, 5.5rem);
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 0.18em;
      text-shadow: 0 0 30px rgba(212, 163, 92, 0.4);
      margin: 0;
    }
    .welcome-divider {
      width: 80px;
      height: 3px;
      background: var(--accent-primary);
      box-shadow: 0 0 10px var(--accent-primary);
      border-radius: 999px;
      margin: var(--spacing-sm) 0;
    }
    .welcome-subtitle {
      color: var(--accent-primary);
      font-size: clamp(1rem, 3vw, 1.3rem);
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    /* 🐝 Honeycomb Overlapping Gallery */
    .gallery-honeycomb {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 30px;
      margin: var(--spacing-xl) 0;
      animation: fadeIn var(--transition-slow) 0.3s forwards;
      opacity: 0;
    }
    .hexagon {
      width: 220px;
      height: 250px;
      position: relative;
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      transition: all var(--transition-slow);
      border: 1px solid rgba(212, 163, 92, 0.3);
      cursor: pointer;
      box-shadow: var(--shadow-lg);
    }
    .hexagon img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }
    .hex-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(12, 9, 6, 0) 40%, rgba(12, 9, 6, 0.7) 100%);
      transition: opacity var(--transition-base);
    }
    
    /* Overlapping adjustments */
    .hex-1 { transform: translateY(-30px); }
    .hex-2 { transform: translateY(30px) scale(1.1); z-index: 3; }
    .hex-3 { transform: translateY(-30px); }

    .hexagon:hover {
      transform: translateY(0) scale(1.15);
      z-index: 5;
      border-color: var(--accent-primary);
      box-shadow: 0 10px 30px rgba(212, 163, 92, 0.4);
    }
    .hexagon:hover img {
      transform: scale(1.1);
    }
    .hexagon:hover .hex-overlay {
      opacity: 0.3;
    }

    /* 🔘 Liquid Button */
    .welcome-actions {
      animation: slideUp 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards;
      opacity: 0;
    }
    .enter-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 16px 48px;
      border-radius: 999px;
      border: 2px solid var(--accent-primary);
      background: transparent;
      text-decoration: none;
      overflow: hidden;
      transition: all var(--transition-base);
      box-shadow: 0 4px 15px rgba(212, 163, 92, 0.1);
    }
    .btn-text {
      position: relative;
      z-index: 3;
      font-family: var(--font-title);
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--accent-primary);
      letter-spacing: 0.08em;
      transition: color var(--transition-base);
    }
    .btn-liquid {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      height: 200%;
      background: var(--accent-primary);
      border-radius: 40%;
      z-index: 2;
      transition: top var(--transition-slow);
    }
    .enter-btn:hover {
      border-color: var(--accent-primary);
      box-shadow: 0 0 35px rgba(212, 163, 92, 0.5);
      transform: translateY(-3px);
    }
    .enter-btn:hover .btn-text {
      color: #0c0906;
    }
    .enter-btn:hover .btn-liquid {
      top: -50%;
      animation: wave 4s linear infinite;
    }

    @keyframes wave {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes slideDown {
      from { transform: translateY(-50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
      to { opacity: 1; }
    }

    @media (max-width: 768px) {
      .gallery-honeycomb {
        flex-direction: column;
        gap: 15px;
      }
      .hex-1, .hex-2, .hex-3 {
        transform: none !important;
      }
      .hexagon {
        width: 180px;
        height: 200px;
      }
      .welcome-brand {
        font-size: 3rem;
      }
    }
  `]
})
export class WelcomeComponent {
  constructor(
    public translate: TranslateService,
    @Inject(DOCUMENT) private document: any
  ) {}

  switchLanguage(language: string) {
    this.translate.use(language);
    localStorage.setItem('sowar_lang', language);
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.dir = dir;
    this.document.documentElement.lang = language;
  }
}
