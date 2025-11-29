import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

@Component({
    tag: 'component-list',
    styleUrl: 'component-list.scss',
    shadow: false,
})
export class ComponentList {
    // items is a list of JSX components or plain HTML strings to render
    // items is a list of native or Stencil elements to render
    @Prop() items: (HTMLElement | Element)[] = [];
    // Optional message to show when the list is empty
    @Prop() emptyMessage: string = 'No records yet.';
    @Event() deleteItem!: EventEmitter<number>;

    private handleDelete(index: number) {
        this.deleteItem.emit(index);
    }


    render() {
        if (!this.items || this.items.length === 0) {
            return (
                <div class="component-list empty">
                    <p>{this.emptyMessage}</p>
                </div>
            );
        }

        return (
            <div class="component-list ">
                <div class="list-container">
                    {this.items.map((item, index) => {
                        return (
                            <div key={index} class="component-list-item">
                                <div class="content">
                                    {item}
                                </div>
                                <button
                                    class="button-style delete-button"
                                    onClick={() => this.handleDelete(index)}
                                    aria-label="Delete item"
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}
