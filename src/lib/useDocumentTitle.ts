import { useEffect } from 'react';

export const SITE_NAME = 'Mahmut Elipek';
export const HOME_TITLE = `${SITE_NAME} | Product Designer & Design Engineer`;

/** Sets the browser tab title while the calling page is mounted. Pass undefined to leave it alone. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
