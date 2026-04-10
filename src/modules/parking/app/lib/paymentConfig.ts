const env = import.meta.env;

const parseNumericEnv = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const paymentConfig = {
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  publishableKey: env.VITE_STRIPE_PUBLISHABLE_KEY ?? '',
  cardPaymentMethodId: parseNumericEnv(env.VITE_PAYMENT_FORM_CARD_ID, 1),
  paymentIdStart: parseNumericEnv(env.VITE_PAYMENT_ID_START, 6),
  planIds: {
    'entre-semana': parseNumericEnv(env.VITE_PAYMENT_PLAN_WEEKDAY_ID, 1),
    sabado: parseNumericEnv(env.VITE_PAYMENT_PLAN_SATURDAY_ID, 2),
    domingo: parseNumericEnv(env.VITE_PAYMENT_PLAN_SUNDAY_ID, 3),
  } as const,
};

export type ParkingPlanKey = keyof typeof paymentConfig.planIds;
