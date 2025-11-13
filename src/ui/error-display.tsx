import { createMemo, JSX, ParentProps, Show } from 'solid-js';
import { toUserFriendlyError } from '~/utils/user-friendly-error';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible';
import { Button } from './button';
import ClipboardCopyIcon from 'lucide-solid/icons/clipboard-copy';
import CheckIcon from 'lucide-solid/icons/check';
import { createClipboard } from '~/utils/create-clipboard';

export function ErrorDisplay(props: { error: unknown; children: JSX.Element }) {
  const friendlyError = createMemo(() => toUserFriendlyError(props.error));
  const [clipboard, { copyToClipboard }] = createClipboard();

  return (
    <Collapsible class="w-full">
      <span>{props.children} </span>
      <CollapsibleTrigger
        as="span"
        class="whitespace-nowrap underline text-indigo-500 cursor-pointer"
      >
        <span class="inline group-data-expanded:hidden">Show details</span>
        <span class="hidden group-data-expanded:inline">Hide details</span>
      </CollapsibleTrigger>
      <CollapsibleContent class="bg-gray-50 p-0">
        <Show when={friendlyError()}>
          {(error) => (
            <div class="p-2 flex items-center">
              <code class="grow">
                <pre>{error().message}</pre>
              </code>
              <Button
                variant="secondary"
                variantStyle="icon-only"
                aria-label={
                  clipboard.isCopied ? 'Copied!' : 'Copy to clipboard'
                }
                icon={clipboard.isCopied ? CheckIcon : ClipboardCopyIcon}
                onClick={() => {
                  copyToClipboard(error().message);
                }}
              />
            </div>
          )}
        </Show>
      </CollapsibleContent>
    </Collapsible>
  );
}
