// IndexedDB wrapper for local storage

class TaktDB {
    constructor() {
        this.db = null;
        this.dbName = 'TaktVisualiserDB';
        this.version = 1;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('tasks')) {
                    const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
                    taskStore.createIndex('zone_id', 'zone_id', { unique: false });
                    taskStore.createIndex('start_date', 'start_date', { unique: false });
                }

                if (!db.objectStoreNames.contains('zones')) {
                    const zoneStore = db.createObjectStore('zones', { keyPath: 'id', autoIncrement: true });
                    zoneStore.createIndex('parent_id', 'parent_id', { unique: false });
                }

                if (!db.objectStoreNames.contains('trades')) {
                    db.createObjectStore('trades', { keyPath: 'id', autoIncrement: true });
                }

                // Add default data
                this.addDefaultData(db);
            };
        });
    }

    addDefaultData(db) {
        // Wait for transaction to complete
        const transaction = db.transaction(['zones', 'trades'], 'readwrite');
        
        // Default zones
        const zoneStore = transaction.objectStore('zones');
        const defaultZones = [
            { id: 1, name: 'Building A', parent_id: null, level: 0 },
            { id: 2, name: 'Floor 1', parent_id: 1, level: 1 },
            { id: 3, name: 'Floor 2', parent_id: 1, level: 1 },
            { id: 4, name: 'Zone 1A', parent_id: 2, level: 2 },
            { id: 5, name: 'Zone 1B', parent_id: 2, level: 2 },
            { id: 6, name: 'Zone 2A', parent_id: 3, level: 2 },
            { id: 7, name: 'Zone 2B', parent_id: 3, level: 2 }
        ];
        defaultZones.forEach(zone => zoneStore.add(zone));

        // Default trades
        const tradeStore = transaction.objectStore('trades');
        const defaultTrades = [
            { id: 1, name: 'Framing', color: '#3498db' },
            { id: 2, name: 'Electrical', color: '#2ecc71' },
            { id: 3, name: 'Plumbing', color: '#f39c12' },
            { id: 4, name: 'Drywall', color: '#e74c3c' },
            { id: 5, name: 'Painting', color: '#9b59b6' }
        ];
        defaultTrades.forEach(trade => tradeStore.add(trade));
    }

    // Generic CRUD operations
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clearAll() {
        const stores = ['tasks', 'zones', 'trades'];
        const promises = stores.map(storeName => {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        });
        return Promise.all(promises);
    }

    // Export data
    async exportData() {
        const tasks = await this.getAll('tasks');
        const zones = await this.getAll('zones');
        const trades = await this.getAll('trades');

        return {
            version: 1,
            exported: new Date().toISOString(),
            data: { tasks, zones, trades }
        };
    }

    // Import data
    async importData(data) {
        await this.clearAll();
        
        // Import in order
        for (const zone of data.data.zones) {
            await this.add('zones', zone);
        }
        for (const trade of data.data.trades) {
            await this.add('trades', trade);
        }
        for (const task of data.data.tasks) {
            await this.add('tasks', task);
        }
    }
}

// Create global instance
const db = new TaktDB();
