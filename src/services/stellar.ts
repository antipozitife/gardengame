// src/services/stellar.ts
import * as StellarSdk from '@stellar/stellar-sdk';
import { Contract, SorobanRpc, scValToNative, Address as StellarAddress } from '@stellar/stellar-sdk';
import { gardenDB } from './gardenDB';

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const sorobanServer = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

const CONTRACT_ADDRESS = 'CAQBOJ52ZNZAKGBS7P3RIIL7VUMYRG7NTTOTSYZHEUZEZIXMNNNDNZG4';
const SHOP_ADDRESS = 'GDGP2QEIYLKNVQO5LSU24Z7Q7GY2JXRG2X4T2KP36VHGAFZDWX3XXYA2';
const NATIVE_TOKEN_ADDRESS = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

// ============ ТИПЫ ============
declare global {
  interface Window {
    albedo?: {
      publicKey(params?: any): Promise<{ pubkey: string }>;
      tx(params: { xdr: string; network?: string; submit?: boolean }): Promise<{ 
        signed_envelope_xdr: string;
        tx_hash: string;
        network: string;
      }>;
    };
  }
}

// ============ ЗАГРУЗКА ALBEDO SDK ============
const loadAlbedoSDK = async (): Promise<void> => {
  if (window.albedo) return;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@albedo-link/intent@0.12.0/lib/albedo.intent.js';
    script.async = true;
    
    script.onload = () => {
      setTimeout(() => {
        if (window.albedo) {
          resolve();
        } else {
          reject(new Error('Albedo SDK не загрузился'));
        }
      }, 500);
    };
    
    script.onerror = () => reject(new Error('Ошибка загрузки Albedo SDK'));
    document.head.appendChild(script);
  });
};

// ============ ПОДКЛЮЧЕНИЕ ALBEDO ============
export const connectAlbedo = async (): Promise<string> => {
  try {
    await loadAlbedoSDK();
    
    if (!window.albedo) {
      throw new Error('Albedo SDK недоступен');
    }

    const result = await window.albedo.publicKey({});
    localStorage.setItem('walletPublicKey', result.pubkey);
    localStorage.setItem('walletType', 'albedo');
    
    return result.pubkey;
  } catch (error) {
    console.error('Ошибка подключения Albedo:', error);
    throw error;
  }
};

// ============ ПОДПИСАНИЕ ТРАНЗАКЦИИ ============
async function signTransaction(xdr: string): Promise<string> {
  await loadAlbedoSDK();
  
  if (!window.albedo) {
    throw new Error('Albedo не найден');
  }

  const result = await window.albedo.tx({ 
    xdr, 
    network: 'testnet',
    submit: false
    // Уберите pubkey - его нет в этом методе
  });

  return result.signed_envelope_xdr;
}



// ============ ПОКУПКА ЦВЕТКА (с контрактом) ============
export const buyFlower = async (
  publicKey: string,
  flowerId: number,
  price: number,
  flowerName: string
): Promise<string> => {
  try {
    const sourceAccount = await server.loadAccount(publicKey);
    const contract = new Contract(CONTRACT_ADDRESS);
    
    const priceInStroops = BigInt(Math.floor(price * 10_000_000));
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        contract.call(
          'buy_flower_with_payment',
          StellarAddress.fromString(publicKey).toScVal(),
          StellarSdk.nativeToScVal(flowerId, { type: 'u32' }),
          StellarSdk.nativeToScVal(priceInStroops, { type: 'i128' }),
          StellarAddress.fromString(SHOP_ADDRESS).toScVal(),
          StellarAddress.fromString(NATIVE_TOKEN_ADDRESS).toScVal()
        )
      )
      .setTimeout(300)
      .build();

    const preparedTx = await sorobanServer.prepareTransaction(transaction);
    const signedXDR = await signTransaction(preparedTx.toXDR());
    
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, networkPassphrase);
    const response = await sorobanServer.sendTransaction(signedTx as any);
    
    console.log(`✅ Покупка отправлена: ${response.hash}`);
    
    await gardenDB.addFlower(flowerId, flowerName, publicKey, price, response.hash);
    
    return response.hash;
  } catch (error: any) {
    console.error('Ошибка покупки:', error);
    throw new Error(error.message || 'Не удалось купить цветок');
  }
};


// ============ ПОЛИВ ЦВЕТОВ ============
export const waterFlowers = async (
  publicKey: string,
  wateringCost: number = 1
): Promise<string> => {
  try {
    // Проверка: можно поливать раз в день
    const lastWatering = localStorage.getItem(`lastWatering_${publicKey}`);
    const now = Date.now();
    
    if (lastWatering) {
      const hoursSinceLastWatering = (now - parseInt(lastWatering)) / (1000 * 60 * 60);
      
      if (hoursSinceLastWatering < 24) {
        const hoursLeft = Math.ceil(24 - hoursSinceLastWatering);
        throw new Error(`Вы уже поливали цветы! Следующий полив через ${hoursLeft} ч.`);
      }
    }

    // ТРАНЗАКЦИЯ 1: Оплата полива
    const sourceAccount1 = await server.loadAccount(publicKey);
    
    const paymentTx = new StellarSdk.TransactionBuilder(sourceAccount1, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: SHOP_ADDRESS,
          asset: StellarSdk.Asset.native(),
          amount: wateringCost.toString(),
        })
      )
      .setTimeout(300)
      .build();

    const signedPaymentXDR = await signTransaction(paymentTx.toXDR());
    const signedPaymentTx = StellarSdk.TransactionBuilder.fromXDR(signedPaymentXDR, networkPassphrase);
    const paymentResponse = await server.submitTransaction(signedPaymentTx);
    
    console.log(`💧 Оплата полива ${wateringCost} XLM: https://stellar.expert/explorer/testnet/tx/${paymentResponse.hash}`);

    // Ждем подтверждения
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ТРАНЗАКЦИЯ 2: Вызов контракта
    const sourceAccount2 = await server.loadAccount(publicKey);
    const contract = new Contract(CONTRACT_ADDRESS);

    const contractTx = new StellarSdk.TransactionBuilder(sourceAccount2, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        contract.call(
          'water_flowers',
          StellarAddress.fromString(publicKey).toScVal()
        )
      )
      .setTimeout(300)
      .build();

    const preparedTx = await sorobanServer.prepareTransaction(contractTx);
    const signedXDR = await signTransaction(preparedTx.toXDR());
    
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, networkPassphrase);
    const response = await sorobanServer.sendTransaction(signedTx as any);

    // Ждем подтверждения
    let status;
    for (let i = 0; i < 30; i++) {
      try {
        status = await sorobanServer.getTransaction(response.hash);
        
        if (status.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
          localStorage.setItem(`lastWatering_${publicKey}`, now.toString());
          console.log(`✅ Полив выполнен: https://stellar.expert/explorer/testnet/tx/${response.hash}`);
          return response.hash;
        }
        
        if (status.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
          throw new Error('Транзакция не выполнена');
        }
      } catch (e) {}
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Истекло время ожидания транзакции');
  } catch (error: any) {
    console.error('Ошибка полива:', error);
    throw error;
  }
};

// Полив отдельного цветка
export const waterSingleFlower = async (
  publicKey: string,
  flowerId: number,
  wateringCost: number = 1
): Promise<string> => {
  try {
    const sourceAccount = await server.loadAccount(publicKey);
    const contract = new Contract(CONTRACT_ADDRESS);
    
    const priceInStroops = BigInt(Math.floor(wateringCost * 10_000_000));
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        contract.call(
          'water_single_flower',
          StellarAddress.fromString(publicKey).toScVal(),
          StellarSdk.nativeToScVal(flowerId, { type: 'u32' }),
          StellarSdk.nativeToScVal(priceInStroops, { type: 'i128' }),
          StellarAddress.fromString(SHOP_ADDRESS).toScVal(),
          StellarAddress.fromString(NATIVE_TOKEN_ADDRESS).toScVal() // Передаем адрес токена
        )
      )
      .setTimeout(300)
      .build();

    const preparedTx = await sorobanServer.prepareTransaction(transaction);
    const signedXDR = await signTransaction(preparedTx.toXDR());
    
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, networkPassphrase);
    const response = await sorobanServer.sendTransaction(signedTx as any);
    
    console.log(`💧 Полив выполнен: ${response.hash}`);
    return response.hash;
    
  } catch (error: any) {
    console.error('Ошибка полива:', error);
    throw error;
  }
};

// Получить время последнего полива
export const getLastWatering = async (
  publicKey: string,
  flowerId: number
): Promise<number> => {
  try {
    const contract = new Contract(CONTRACT_ADDRESS);
    const account = await server.loadAccount(publicKey);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        contract.call(
          'get_last_watering',
          StellarAddress.fromString(publicKey).toScVal(),
          StellarSdk.nativeToScVal(flowerId, { type: 'u32' })
        )
      )
      .setTimeout(300)
      .build();

    const preparedTx = await sorobanServer.prepareTransaction(transaction);
    const result = await sorobanServer.simulateTransaction(preparedTx);

    if (SorobanRpc.Api.isSimulationSuccess(result)) {
      const timestamp = scValToNative(result.result!.retval);
      return timestamp || 0;
    }

    return 0;
  } catch (error) {
    console.error('Ошибка получения времени полива:', error);
    return 0;
  }
};


// ============ ПРОДАЖА БУКЕТА ============
export const sellBouquet = async (
  publicKey: string,
  bouquetPrice: number
): Promise<string> => {
  try {
    // Простая заглушка - возвращаем деньги игроку
    // В реальном приложении нужен отдельный сервер для этого
    console.log(`💐 Продан букет за ${bouquetPrice} XLM`);
    
    // Имитируем успешную продажу
    const fakeHash = 'BOUQUET_' + Date.now();
    
    // В будущем здесь должна быть реальная транзакция от сервера
    return fakeHash;
  } catch (error: any) {
    console.error('Ошибка продажи букета:', error);
    throw error;
  }
};

// ============ ПОЛУЧЕНИЕ БАЛАНСА XLM ============
export const getFLWBalance = async (publicKey: string): Promise<number> => {
  try {
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(
      (balance: any) => balance.asset_type === 'native'
    );
    return xlmBalance ? parseFloat(xlmBalance.balance) : 0;
  } catch (error) {
    console.error('Ошибка получения баланса XLM:', error);
    return 0;
  }
};

export const getBalance = getFLWBalance;

// ============ ПОЛУЧЕНИЕ САДА ============
export const getUserGarden = async (publicKey: string): Promise<number[]> => {
  try {
    const contract = new Contract(CONTRACT_ADDRESS);
    const account = await server.loadAccount(publicKey);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        contract.call(
          'get_garden',
          StellarAddress.fromString(publicKey).toScVal()
        )
      )
      .setTimeout(300)
      .build();

    const preparedTx = await sorobanServer.prepareTransaction(transaction);
    const result = await sorobanServer.simulateTransaction(preparedTx);

    if (SorobanRpc.Api.isSimulationSuccess(result)) {
      const garden = scValToNative(result.result!.retval);
      return Array.isArray(garden) ? garden : Object.values(garden);
    }

    return [0, 0, 0, 0, 0];
  } catch (error) {
    console.error('Ошибка получения сада:', error);
    return [0, 0, 0, 0, 0];
  }
};

// ============ ПРОВЕРКА ВРЕМЕНИ ПОЛИВА ============
export const canWaterFlowers = (publicKey: string): { canWater: boolean; hoursLeft: number } => {
  const lastWatering = localStorage.getItem(`lastWatering_${publicKey}`);
  
  if (!lastWatering) {
    return { canWater: true, hoursLeft: 0 };
  }
  
  const now = Date.now();
  const hoursSinceLastWatering = (now - parseInt(lastWatering)) / (1000 * 60 * 60);
  
  if (hoursSinceLastWatering >= 24) {
    return { canWater: true, hoursLeft: 0 };
  }
  
  return { 
    canWater: false, 
    hoursLeft: Math.ceil(24 - hoursSinceLastWatering) 
  };
};

export type WalletType = 'albedo';
export const connectWallet = async (walletType: WalletType = 'albedo'): Promise<string> => {
  return await connectAlbedo();
};
