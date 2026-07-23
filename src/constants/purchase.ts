export type PurchaseStep = 'idle' | 'buying' | 'confirming' | 'waiting' | 'done';

export const PURCHASE_STEP_LABELS: Record<Exclude<PurchaseStep, 'idle'>, string> = {
  buying: 'Покупка цветка...',
  confirming: 'Подтверждение кошелька...',
  waiting: 'Ожидание сети...',
  done: 'Готово!',
};
