import { useMutation } from '@tanstack/solid-query';
import { onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';

const SHOW_COPIED_TIMEOUT_MS = 3_000;

export function createClipboard() {
  const [state, setState] = createStore({
    isCopied: false,
    canCopy: !!navigator.clipboard,
  });
  let timeout: number | undefined;

  onCleanup(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  const copy = useMutation(() => ({
    mutationFn: async (data: ClipboardItems | string) => {
      if (typeof data === 'string') {
        await navigator.clipboard.writeText(data);
      } else {
        await navigator.clipboard.write(data);
      }

      setState('isCopied', true);
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = window.setTimeout(() => {
        setState('isCopied', false);
      }, SHOW_COPIED_TIMEOUT_MS);
    },
  }));

  return [
    state,
    {
      copyToClipboard: copy.mutate,
      copyToClipboardAsync: copy.mutateAsync,
    },
  ] as const;
}
