import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  messages = signal<ToastMessage[]>([]);
  private nextId = 1;

  success(text: string) { this.show('success', text); }
  error(text: string) { this.show('error', text); }
  info(text: string) { this.show('info', text); }

  show(type: ToastMessage['type'], text: string) {
    const message = { id: this.nextId++, type, text };
    this.messages.update(messages => [...messages, message]);
    setTimeout(() => this.dismiss(message.id), 4500);
  }

  dismiss(id: number) {
    this.messages.update(messages => messages.filter(message => message.id !== id));
  }
}
