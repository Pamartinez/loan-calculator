import { Component, h, State } from '@stencil/core';
import { exportAllDataAsJSON, importDataFromJSON, clearAllLoanData } from '../../utils/local-storage-helper';

@Component({
    tag: 'export-json-controller',
    styleUrl: 'export-json-controller.scss',
    shadow: true,
})
export class ExportJsonController {
    @State() importStatus: string = '';
    @State() showImportSuccess: boolean = false;
    @State() showImportError: boolean = false;

    private fileInputRef: HTMLInputElement;

    private handleExport = () => {
        const jsonData = exportAllDataAsJSON();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loan-calculator-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    private handleImportClick = () => {
        this.fileInputRef?.click();
    };

    private handleFileChange = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const success = importDataFromJSON(content);

                    if (success) {
                        this.importStatus = 'Data imported successfully! Reloading...';
                        this.showImportSuccess = true;
                        this.showImportError = false;

                        // Reload the page after a short delay to reflect the imported data
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        this.importStatus = 'Failed to import data. Please check the file format.';
                        this.showImportSuccess = false;
                        this.showImportError = true;
                    }
                } catch (error) {
                    this.importStatus = 'Error reading file. Please select a valid JSON file.';
                    this.showImportSuccess = false;
                    this.showImportError = true;
                }

                // Clear status after 3 seconds
                setTimeout(() => {
                    this.importStatus = '';
                    this.showImportSuccess = false;
                    this.showImportError = false;
                }, 3000);
            };

            reader.readAsText(file);
        }

        // Reset the input so the same file can be selected again
        input.value = '';
    };

    private handleClearData = () => {
        if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
            clearAllLoanData();
            this.importStatus = 'All data cleared! Reloading...';
            this.showImportSuccess = true;
            this.showImportError = false;

            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    };

    render() {
        return (
            <div class="export-json-controller">
                <h2>Data Management</h2>
                <p class="description">
                    Export your loan data to backup, share, or transfer between devices. Import previously exported data to restore your calculations.
                </p>

                <div class="button-container">
                    <button class="button-style export-btn" onClick={this.handleExport}>
                        <span class="icon">📥</span>
                        Export to JSON
                    </button>

                    <button class="button-style import-btn" onClick={this.handleImportClick}>
                        <span class="icon">📤</span>
                        Import from JSON
                    </button>

                    <button class="button-style-delete" onClick={this.handleClearData}>
                        Clear All Data
                    </button>
                </div>

                <input
                    type="file"
                    accept=".json"
                    ref={(el) => this.fileInputRef = el}
                    onChange={this.handleFileChange}
                    style={{ display: 'none' }}
                />

                {this.importStatus && (
                    <div class={{
                        'status-message': true,
                        'success': this.showImportSuccess,
                        'error': this.showImportError
                    }}>
                        {this.importStatus}
                    </div>
                )}

                <div class="info-section">
                    <h3>About Data Storage</h3>
                    <ul>
                        <li>All data is stored locally in your browser's localStorage</li>
                        <li>Export regularly to backup your loan calculations</li>
                        <li>Imported data will replace all current data</li>
                        <li>Data is specific to this browser and device</li>
                    </ul>
                </div>
            </div>
        );
    }
}
