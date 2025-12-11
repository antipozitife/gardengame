// src/services/stellar.ts
import * as StellarSdk from '@stellar/stellar-sdk';
import { Contract, SorobanRpc, scValToNative, Address as StellarAddress } from '@stellar/stellar-sdk';
import { gardenDB } from './gardenDB';

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const sorobanServer = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Замените на адрес вашего развернутого контракта
const CONTRACT_ADDRESS = 'CAXMICEX25UZYTAUFAX47QHIAW5QNT52LDN3DNS3ZQZB6S3CWBJCOM3Z';

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
    submit: false // Мы отправим сами для контроля
  });

  return result.signed_envelope_xdr;
}

// ============ ПОКУПКА ЦВЕТКА ============
export const buyFlower = async (
  publicKey: string,
  flowerId: number,
  price: number,
  flowerName: string
): Promise<string> => {
  try {
    const account = await server.loadAccount(publicKey);
    const contract = new Contract(CONTRACT_ADDRESS);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        contract.call(
          'buy_flower',
          StellarAddress.fromString(publicKey).toScVal(),
          StellarSdk.nativeToScVal(flowerId, { type: 'u32' })
        )
      )
      .setTimeout(300)
      .build();

    const preparedTx = await sorobanServer.prepareTransaction(transaction);
    const signedXDR = await signTransaction(preparedTx.toXDR());
    
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, networkPassphrase);
    const response = await sorobanServer.sendTransaction(signedTx as any);

    // Ждем подтверждения транзакции
    let status;
    for (let i = 0; i < 30; i++) {
      try {
        status = await sorobanServer.getTransaction(response.hash);
        
        if (status.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
          // Сохраняем в локальную БД
          await gardenDB.addFlower(flowerId, flowerName, publicKey, price, response.hash);
          console.log(`✅ Транзакция успешна: https://stellar.expert/explorer/testnet/tx/${response.hash}`);
          return response.hash;
        }
        
        if (status.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
          throw new Error('Транзакция не выполнена');
        }
      } catch (e) {
        // Продолжаем ждать
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Истекло время ожидания транзакции');
  } catch (error) {
    console.error('Ошибка покупки:', error);
    throw error;
  }
};

// ============ ПОЛИВ ЦВЕТОВ ============
export const waterFlowers = async (
  publicKey: string,
  wateringCost?: number // Параметр опциональный для совместимости
): Promise<string> => {
  try {
    const account = await server.loadAccount(publicKey);
    const contract = new Contract(CONTRACT_ADDRESS);

    const transaction = new StellarSdk.TransactionBuilder(account, {
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

    const preparedTx = await sorobanServer.prepareTransaction(transaction);
    const signedXDR = await signTransaction(preparedTx.toXDR());
    
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, networkPassphrase);
    const response = await sorobanServer.sendTransaction(signedTx as any);

    // Ждем подтверждения
    let status;
    for (let i = 0; i < 30; i++) {
      try {
        status = await sorobanServer.getTransaction(response.hash);
        
        if (status.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
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
  } catch (error) {
    console.error('Ошибка полива:', error);
    throw error;
  }
};

// ============ ПРОДАЖА БУКЕТА ============
export const sellBouquet = async (
  publicKey: string,
  bouquetPrice: number
): Promise<string> => {
  try {
    // Пока используем простую заглушку
    // В будущем можно добавить реальную транзакцию продажи
    console.log(`💐 Продан букет за ${bouquetPrice} XLM`);
    
    // Возвращаем фейковый хеш транзакции
    const fakeHash = 'BOUQUET_SALE_' + Date.now();
    console.log(`✅ Продажа букета: ${fakeHash}`);
    
    return fakeHash;
  } catch (error) {
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

// Алиас для обратной совместимости
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

// ============ ЭКСПОРТ ТИПА ============
export type WalletType = 'albedo';

// ============ УНИВЕРСАЛЬНОЕ ПОДКЛЮЧЕНИЕ (только Albedo) ============
export const connectWallet = async (walletType: WalletType = 'albedo'): Promise<string> => {
  return await connectAlbedo();
};
