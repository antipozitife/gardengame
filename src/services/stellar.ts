import * as StellarSdk from '@stellar/stellar-sdk';
import {
  Contract,
  SorobanRpc,
  scValToNative,
  Address as StellarAddress,
} from '@stellar/stellar-sdk';
import albedo from '@albedo-link/intent';
import { gardenDB } from './gardenDB';
import { getErrorMessage } from '../utils/getErrorMessage';
import {
  CONTRACT_ADDRESS,
  HORIZON_URL,
  NATIVE_TOKEN_ADDRESS,
  SHOP_ADDRESS,
  SOROBAN_RPC_URL,
} from '../constants/stellar';

const server = new StellarSdk.Horizon.Server(HORIZON_URL);
const sorobanServer = new SorobanRpc.Server(SOROBAN_RPC_URL);
const network = process.env.REACT_APP_STELLAR_NETWORK === 'public' ? 'public' : 'testnet';
const networkPassphrase =
  network === 'public' ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET;
const TRANSACTION_POLL_INTERVAL_MS = 1_500;
const TRANSACTION_POLL_ATTEMPTS = 20;

export const connectAlbedo = async (): Promise<string> => {
  const result = await albedo.publicKey({});
  return result.pubkey;
};

async function signTransaction(xdr: string): Promise<string> {
  const result = await albedo.tx({
    xdr,
    network,
    submit: false,
  });

  return result.signed_envelope_xdr;
}

const waitForTransaction = async (hash: string): Promise<void> => {
  for (let attempt = 0; attempt < TRANSACTION_POLL_ATTEMPTS; attempt += 1) {
    const result = await sorobanServer.getTransaction(hash);

    if (result.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) return;
    if (result.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error('Транзакция отклонена сетью Stellar');
    }

    await new Promise((resolve) => window.setTimeout(resolve, TRANSACTION_POLL_INTERVAL_MS));
  }

  throw new Error('Сеть Stellar не подтвердила транзакцию вовремя');
};

const submitTransaction = async (transaction: StellarSdk.Transaction): Promise<string> => {
  const response = await sorobanServer.sendTransaction(transaction);

  if (response.status !== 'PENDING' && response.status !== 'DUPLICATE') {
    throw new Error('Сеть Stellar не приняла транзакцию');
  }

  await waitForTransaction(response.hash);
  return response.hash;
};

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
    const txHash = await submitTransaction(signedTx as StellarSdk.Transaction);
    await gardenDB.addFlower(flowerId, flowerName, publicKey, price, txHash);

    return txHash;
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
    return submitTransaction(signedTx as StellarSdk.Transaction);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Не удалось полить цветок'));
  }
};

export const getLastWatering = async (publicKey: string, flowerId: number): Promise<number> => {
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
    const xlmBalance = account.balances.find((balance) => balance.asset_type === 'native');
    return xlmBalance && 'balance' in xlmBalance ? parseFloat(xlmBalance.balance) : 0;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Не удалось получить баланс XLM'));
  }
};
