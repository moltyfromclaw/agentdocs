import { Context } from 'hono';

interface X402Options {
  amount: string; // USD amount, e.g., "0.05"
  description: string;
  resource: string;
}

/**
 * Return a 402 Payment Required response with x402 payment requirements
 */
export function X402PaymentRequired(c: Context, options: X402Options) {
  const paymentAddress = c.env?.X402_PAYMENT_ADDRESS || '0x0000000000000000000000000000000000000000';
  
  return c.json(
    {
      status: 402,
      message: 'Payment Required',
      description: options.description,
      resource: options.resource,
      accepts: [
        {
          network: 'base',
          asset: 'USDC',
          amount: options.amount,
          recipient: paymentAddress,
        },
        {
          network: 'base-sepolia',
          asset: 'USDC',
          amount: options.amount,
          recipient: paymentAddress,
        },
      ],
      x402Version: '1.0',
      docs: 'https://x402.org',
    },
    402
  );
}

/**
 * Middleware that requires x402 payment for a route
 */
export function x402Middleware(options: Omit<X402Options, 'resource'>) {
  return async (c: Context, next: () => Promise<void>) => {
    const paymentHeader = c.req.header('X-Payment');
    
    if (!paymentHeader) {
      return X402PaymentRequired(c, {
        ...options,
        resource: c.req.path,
      });
    }
    
    // TODO: Verify payment on-chain
    // For MVP, we accept any payment header and log it
    // In production:
    // 1. Parse the payment header (tx hash or signed message)
    // 2. Verify on Base/Solana that payment was made
    // 3. Check amount matches required
    // 4. Check recipient is correct
    
    // Store payment info for logging
    c.set('x402Payment', {
      header: paymentHeader,
      amount: options.amount,
      verified: false, // TODO: Set to true after on-chain verification
    });
    
    await next();
  };
}

/**
 * Verify a payment on-chain (placeholder)
 * 
 * In production, this would:
 * 1. Parse the X-Payment header (could be tx hash or EIP-712 signed message)
 * 2. Query Base/Solana RPC to verify the transaction
 * 3. Check amount and recipient
 * 4. Return verification result
 */
export async function verifyPayment(
  paymentHeader: string,
  expectedAmount: string,
  expectedRecipient: string
): Promise<{ valid: boolean; txHash?: string; error?: string }> {
  // TODO: Implement on-chain verification
  // For now, accept all payments
  return {
    valid: true,
    txHash: paymentHeader,
  };
}
