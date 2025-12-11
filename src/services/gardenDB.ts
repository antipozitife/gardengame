// src/services/gardenDB.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface Flower {
  id?: number;
  flowerId: number;
  name: string;
  walletAddress: string;
  price: number;
  purchaseDate: number;
  transactionHash: string;
}

interface GardenDB extends DBSchema {
  flowers: {
    key: number;
    value: Flower;
    indexes: { 
      'by-wallet': string;
      'by-date': number;
    };
  };
}

class GardenDatabase {
  private db: IDBPDatabase<GardenDB> | null = null;

  async init() {
    if (this.db) return;

    this.db = await openDB<GardenDB>('garden-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('flowers')) {
          const flowerStore = db.createObjectStore('flowers', {
            keyPath: 'id',
            autoIncrement: true,
          });
          flowerStore.createIndex('by-wallet', 'walletAddress');
          flowerStore.createIndex('by-date', 'purchaseDate');
        }
      },
    });
  }

  async addFlower(
    flowerId: number,
    name: string,
    walletAddress: string,
    price: number,
    transactionHash: string
  ) {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.add('flowers', {
      flowerId,
      name,
      walletAddress,
      price,
      purchaseDate: Date.now(),
      transactionHash,
    });
  }

  async getFlowersByUser(walletAddress: string): Promise<Flower[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('flowers', 'readonly');
    const index = tx.store.index('by-wallet');
    return await index.getAll(walletAddress);
  }

  async getAllFlowers(): Promise<Flower[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAll('flowers');
  }

  async deleteFlower(id: number) {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete('flowers', id);
  }

  async clearAllFlowers() {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.clear('flowers');
  }
}

export const gardenDB = new GardenDatabase();
