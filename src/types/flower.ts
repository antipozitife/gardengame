export interface Flower {
  id: number;
  name: string;
  image: string;
  price: number;
  incomeValue: number;
  rarity: string;
  rarityColor: string;
}

export interface OwnedFlower {
  id: number;
  name: string;
  image: string;
  quantity: number;
  waterLevel: number;
  rarity: string;
  rarityColor: string;
  incomeValue: number;
  lastWatered: number;
}

export interface FlowerPurchase {
  id?: number;
  flowerId: number;
  flowerName: string;
  price: number;
  publicKey: string;
  timestamp: number;
  txHash: string;
}
