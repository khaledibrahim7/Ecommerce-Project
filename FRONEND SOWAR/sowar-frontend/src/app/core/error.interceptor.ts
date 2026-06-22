import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

const messages: Record<string, string> = {
  VALIDATION_FAILED: 'راجع البيانات المطلوبة وحاول تاني.',
  RESOURCE_NOT_FOUND: 'العنصر المطلوب غير موجود.',
  DUPLICATE_RESOURCE: 'البيان ده مستخدم قبل كده.',
  UNAUTHORIZED: 'سجل دخولك الأول.',
  FORBIDDEN: 'الجلسة انتهت أو غير مسموح بالعملية دي.',
  INSUFFICIENT_STOCK: 'الكمية المطلوبة غير متاحة في الاستوك.',
  FILE_UPLOAD_FAILED: 'رفع الصورة فشل. جرب صورة تانية.',
  INTERNAL_ERROR: 'حصل خطأ في السيرفر. حاول تاني.'
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if ((error.status === 401 || error.status === 403) && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
        localStorage.removeItem('sowar_token');
        localStorage.removeItem('sowar_user');
        auth.user.set(null);
        toast.error('الجلسة انتهت. سجل دخولك تاني.');
        router.navigateByUrl('/login');
        return throwError(() => error);
      }

      if (error.status === 404 && req.url.includes('/auth/register')) {
        toast.error('Endpoint التسجيل مش موجود على السيرفر الشغال. اعمل restart للباك وشغل آخر نسخة.');
        return throwError(() => error);
      }

      const code = error.error?.code;
      const text = messages[code] || error.error?.message || 'حصل خطأ غير متوقع.';
      toast.error(text);
      return throwError(() => error);
    })
  );
};
