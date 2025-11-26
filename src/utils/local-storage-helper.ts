/**
 * Local Storage Helper Utility
 * Provides consistent key naming and helper methods for localStorage operations
 */

// Storage key constants
export const STORAGE_KEYS = {
    LOAN_DATA_DICTIONARY: 'loanDataDictionary',
    CURRENT_LOAN_DATA: 'currentLoanData',
    AMORTIZATION_ENTRIES: 'amortizationEntries',
} as const;

/**
 * Save data to localStorage with error handling
 * @param key - The storage key from STORAGE_KEYS
 * @param data - The data to store (will be JSON stringified)
 * @returns boolean indicating success
 */
export function saveToLocalStorage<T>(key: string, data: T): boolean {
    try {
        const jsonString = JSON.stringify(data);
        localStorage.setItem(key, jsonString);
        return true;
    } catch (error) {
        console.error(`Failed to save to localStorage (key: ${key}):`, error);
        return false;
    }
}

/**
 * Load data from localStorage with error handling
 * @param key - The storage key from STORAGE_KEYS
 * @param defaultValue - Optional default value if key doesn't exist or parsing fails
 * @returns The parsed data or default value
 */
export function loadFromLocalStorage<T>(key: string, defaultValue: T = null): T {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        return JSON.parse(item) as T;
    } catch (error) {
        console.error(`Failed to load from localStorage (key: ${key}):`, error);
        return defaultValue;
    }
}

/**
 * Remove an item from localStorage
 * @param key - The storage key from STORAGE_KEYS
 * @returns boolean indicating success
 */
export function removeFromLocalStorage(key: string): boolean {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Failed to remove from localStorage (key: ${key}):`, error);
        return false;
    }
}

/**
 * Clear all loan calculator data from localStorage
 */
export function clearAllLoanData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
        removeFromLocalStorage(key);
    });
}

/**
 * Export all loan calculator data as JSON string
 * @returns JSON string containing all stored data
 */
export function exportAllDataAsJSON(): string {
    const allData: Record<string, any> = {};

    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        const data = loadFromLocalStorage(key);
        if (data !== null) {
            allData[name] = data;
        }
    });

    return JSON.stringify(allData, null, 2);
}

/**
 * Import data from JSON string and save to localStorage
 * @param jsonString - JSON string containing data to import
 * @returns boolean indicating success
 */
export function importDataFromJSON(jsonString: string): boolean {
    try {
        const data = JSON.parse(jsonString);

        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            if (data[name] !== undefined) {
                saveToLocalStorage(key, data[name]);
            }
        });

        return true;
    } catch (error) {
        console.error('Failed to import data from JSON:', error);
        return false;
    }
}

/**
 * Check if localStorage is available and working
 * @returns boolean indicating if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
    try {
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
}
