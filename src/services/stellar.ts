import * as StellarSdk from '@stellar/stellar-sdk';
import { Contract, SorobanRpc, scValToNative, Address as StellarAddress } from '@stellar/stellar-sdk';
import { gardenDB } from './gardenDB';
import { getErrorMessage } from '../utils/getErrorMessage';

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const sorobanServer = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

const CONTRACT_ADDRESS = 'CAQBOJ52ZNZAKGBS7P3RIIL7VUMYRG7NTTOTSYZHEUZEZIXMNNNDNZG4';
const SHOP_ADDRESS = 'GDGP2QEIYLKNVQO5LSU24Z7Q7GY2JXRG2X4T2KP36VHGAFZDWX3XXYA2';
const NATIVE_TOKEN_ADDRESS = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

declare global {
  interface Window {
    albedo?: {
      publicKey(params?: Record<string, unknown>): Promise<{ pubkey: string }>;
      tx(params: { xdr: string; network?: string; submit?: boolean }): Promise<{
        signed_envelope_xdr: string;
        tx_hash: string;
        network: string;
      }>;
    };
  }
}

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

export const connectAlbedo = async (): Promise<string> => {
  await loadAlbedoSDK();

  if (!window.albedo) {
    throw new Error('Albedo SDK недоступен');
  }

  const result = await window.albedo.publicKey({});
  return result.pubkey;
};

async function signTransaction(xdr: string): Promise<string> {
  await loadAlbedoSDK();

  if (!window.albedo) {
    throw new Error('Albedo не найден');
  }

  const result = await window.albedo.tx({
    xdr,
    network: 'testnet',
    submit: false,
  });

  return result.signed_envelope_xdr;
}

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
    const response = await sorobanServer.sendTransaction(signedTx as StellarSdk.Transaction);

    await gardenDB.addFlower(flowerId, flowerName, publicKey, price, response.hash);

    return response.hash;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Не удалось купить цветок'));
  }
};

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
          StellarAddress.fromString(NATIVE_TOKEN_ADDRESS).toScVal()
        )
      )
      .setTimeout(300)
      .build();

    const preparedTx = await sorobanServer.prepareTransaction(transaction);
    const signedXDR = await signTransaction(preparedTx.toXDR());

    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, networkPassphrase);
    const response = await sorobanServer.sendTransaction(signedTx as StellarSdk.Transaction);

    return response.hash;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Не удалось полить цветок'));
  }
};

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
  } catch {
    return 0;
  }
};

export const getXLMBalance = async (publicKey: string): Promise<number> => {
  try {
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(
      (balance) => balance.asset_type === 'native'
    );
    return xlmBalance && 'balance' in xlmBalance ? parseFloat(xlmBalance.balance) : 0;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Не удалось получить баланс XLM'));
  }
};
