import { useEffect } from 'react';
import Swal from 'sweetalert2';

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 Jam
const LAST_ACTIVITY_KEY = 'pendaftar_last_activity';
const CHECK_INTERVAL_MS = 15 * 1000; // Cek setiap 15 detik

export const useRegistrantIdleLogout = () => {
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'Pendaftar Vendor') {
      return;
    }

    const now = Date.now();
    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    }

    let lastRecorded = Date.now();
    const updateActivity = () => {
      const current = Date.now();
      // Throttle localStorage updates to once every 5 seconds
      if (current - lastRecorded > 5000) {
        lastRecorded = current;
        localStorage.setItem(LAST_ACTIVITY_KEY, String(current));
      }
    };

    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    events.forEach((evt) => {
      window.addEventListener(evt, updateActivity as EventListener, { passive: true });
    });

    const intervalId = setInterval(() => {
      const currentRole = localStorage.getItem('userRole');
      if (currentRole !== 'Pendaftar Vendor') {
        return;
      }

      const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
      const lastActive = stored ? parseInt(stored, 10) : Date.now();
      const diff = Date.now() - lastActive;

      if (diff >= IDLE_TIMEOUT_MS) {
        clearInterval(intervalId);
        events.forEach((evt) => {
          window.removeEventListener(evt, updateActivity as EventListener);
        });

        // Hapus token dan sesi
        localStorage.clear();

        Swal.fire({
          icon: 'warning',
          title: 'Sesi Telah Berakhir',
          text: 'Anda tidak aktif selama 1 jam. Silakan login kembali.',
          confirmButtonText: 'Login Kembali',
          confirmButtonColor: '#1E2A78',
          allowOutsideClick: false,
        }).then(() => {
          window.location.href = '/login';
        });

        setTimeout(() => {
          window.location.href = '/login';
        }, 5000);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      events.forEach((evt) => {
        window.removeEventListener(evt, updateActivity as EventListener);
      });
    };
  }, []);
};
