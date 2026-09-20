'use client';

// ============================================================
//  Native OS desktop notifications for the external-system steps
//  (Alteryx / ROC). Those systems run outside DealOS, so the
//  analyst needs to be told when a job finishes even if this tab
//  is in the background — that's the moment they go move the file
//  into the next system.
// ============================================================
import { useCallback, useEffect, useState } from 'react';

export type NotifyPermission = 'unsupported' | 'default' | 'granted' | 'denied';

export function useDesktopNotifications() {
  const [permission, setPermission] = useState<NotifyPermission>('default');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as NotifyPermission);
  }, []);

  const request = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as NotifyPermission);
  }, []);

  const notify = useCallback(async (title: string, body: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;

    if (Notification.permission === 'granted') {
      new Notification(title, { body, tag: 'dealos-external-step' });
      return true;
    }

    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result as NotifyPermission);
      if (result === 'granted') {
        new Notification(title, { body, tag: 'dealos-external-step' });
        return true;
      }
    }

    return false;
  }, []);

  return { permission, request, notify };
}
