import { Component, h, Prop, State, VNode, Watch, Event, EventEmitter } from '@stencil/core';

export interface TabItem {
  name: string;
  content: VNode;
}

@Component({
  tag: 'tabs-controller',
  styleUrl: 'tabs-controller.scss',
  shadow: true,
})
export class TabsController {
  @Prop() tabs: TabItem[] = [];
  @Prop() defaultActiveIndex?: number = 0;

  @State() activeTabIndex: number = 0;

  @Event() tabChange: EventEmitter<number>;

  componentWillLoad() {
    if (this.defaultActiveIndex !== undefined && this.defaultActiveIndex >= 0 && this.defaultActiveIndex < this.tabs.length) {
      this.activeTabIndex = this.defaultActiveIndex;
    }
  }

  @Watch('defaultActiveIndex')
  handleDefaultActiveIndexChange(newValue: number) {
    if (newValue !== undefined && newValue >= 0 && newValue < this.tabs.length) {
      this.activeTabIndex = newValue;
    }
  }

  private setActiveTab(index: number) {
    this.activeTabIndex = index;
    this.tabChange.emit(index);
  }

  render() {
    if (!this.tabs || this.tabs.length === 0) {
      return null;
    }

    return (
      <div>
        {/* Tabs */}
        <div class="tabs">
          {this.tabs.map((tab, index) => (
            <button
              key={index}
              class={this.activeTabIndex === index ? 'tab active' : 'tab'}
              onClick={() => this.setActiveTab(index)}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div class="tab-content">
          {this.tabs[this.activeTabIndex]?.content}
        </div>
      </div>
    );
  }
}
