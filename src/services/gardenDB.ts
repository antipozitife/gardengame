// src/services/gardenDB.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FlowerPurchase {
  id?: number;
  flowerId: number;
  flowerName: string;
  price: number;
  publicKey: string;
  timestamp: number;
  txHash: string;
}

interface FlowerGameDB extends DBSchema {
  flowers: {
    key: number;
    value: FlowerPurchase;
    indexes: { 'by-publicKey': string };
  };
}

class GardenDB {
  private dbPromise: Promise<IDBPDatabase<FlowerGameDB>> | null = null;

  async init() {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = openDB<FlowerGameDB>('FlowerGameDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('flowers')) {
          const store = db.createObjectStore('flowers', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('by-publicKey', 'publicKey');
        }
      },
    });

    return this.dbPromise;
  }

  async addFlower(
    flowerId: number,
    flowerName: string,
    publicKey: string,
    price: number,
    txHash: string
  ) {
    const db = await this.init();
    await db.add('flowers', {
      flowerId,
      flowerName,
      publicKey,
      price,
      timestamp: Date.now(),
      txHash,
    });
  }

  async getAllFlowers(): Promise<FlowerPurchase[]> {
    const db = await this.init();
    return db.getAll('flowers');
  }

  async getFlowersByUser(publicKey: string): Promise<FlowerPurchase[]> {
    const db = await this.init();
    return db.getAllFromIndex('flowers', 'by-publicKey', publicKey);
  }
}

export const gardenDB = new GardenDB();
