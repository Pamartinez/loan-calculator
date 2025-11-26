import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'popup-modal',
  styleUrl: 'popup-modal.scss',
  shadow: false,
})
export class PopupModal {
  @Prop() modalTitle: string;
  @Prop() isOpen: boolean = false;
  @Event() closePopup: EventEmitter<void>;

  handleClose() {
    this.closePopup.emit();
  }

  render() {
    if (!this.isOpen) {
      return null;
    }

    return (
      <div class="popup-overlay" onClick={() => this.handleClose()}>
        <div class="popup-content" onClick={(e) => e.stopPropagation()}>
          <div class="popup-header">
            <h3>{this.modalTitle}</h3>
            <button class="button-style close-button" onClick={() => this.handleClose()}>×</button>
          </div>
          <div class="popup-body">
            <slot />
          </div>
        </div>
      </div>
    );
  }
}
