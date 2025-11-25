import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
    tag: 'date-input',
    styleUrl: 'date-input.scss',
    shadow: true,
})
export class DateInput {
    @Prop() value: string = '';
    @Prop() inputId: string = 'date-input';
    @Prop() max: string = '';

    @Event() dateChange: EventEmitter<string>;

    private getDefaultMaxDate(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    private handleInput = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        this.dateChange.emit(value);
    };

    private handleKeyDown = (e: KeyboardEvent) => {
        const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'];
        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    };

    render() {
        return (
            <input
                type="month"
                id={this.inputId}
                class="input-style"
                value={this.value || ''}
                max={this.max || this.getDefaultMaxDate()}
                onInput={this.handleInput}
                onKeyDown={this.handleKeyDown}
            />
        );
    }
}
