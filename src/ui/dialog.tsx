import { Dialog as KobalteDialog } from '@kobalte/core/dialog';
import CrossIcon from 'lucide-solid/icons/x';

export function Dialog() {
  return (
    <KobalteDialog>
      <KobalteDialog.Trigger class="dialog__trigger">
        Open
      </KobalteDialog.Trigger>
      <KobalteDialog.Portal>
        <KobalteDialog.Overlay class="fixed inset-0 z-50 bg-black/20" />
        <div class="dialog__positioner">
          <KobalteDialog.Content class="dialog__content">
            <div class="dialog__header">
              <KobalteDialog.Title class="dialog__title">
                About Kobalte
              </KobalteDialog.Title>
              <KobalteDialog.CloseButton class="dialog__close-button">
                <CrossIcon />
              </KobalteDialog.CloseButton>
            </div>
            <KobalteDialog.Description class="dialog__description">
              Kobalte is a UI toolkit for building accessible web apps and
              design systems with SolidJS. It provides a set of low-level UI
              components and primitives which can be the foundation for your
              design system implementation.
            </KobalteDialog.Description>
          </KobalteDialog.Content>
        </div>
      </KobalteDialog.Portal>
    </KobalteDialog>
  );
}
