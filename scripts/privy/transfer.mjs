// Builds an unsigned USDC (SPL token) transfer for Solana, with a memo that
// carries the Naga order reference so the server can match payment to order.
import {
  address, AccountRole, appendTransactionMessageInstructions, compileTransaction, createNoopSigner,
  createTransactionMessage, getTransactionEncoder, pipe, setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/kit';
import {
  findAssociatedTokenPda, getCreateAssociatedTokenIdempotentInstruction, getTransferCheckedInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from '@solana-program/token';

export const MEMO_PROGRAM = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

/** Amount in base units (USDC has 6 decimals): "1530.00" -> 1530000000n */
export function toBaseUnits(amount, decimals) {
  const [whole, frac = ''] = String(amount).split('.');
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt((frac + '0'.repeat(decimals)).slice(0, decimals) || '0');
}

export async function buildUsdcTransfer({ payer, recipient, mint, amount, decimals, memo, blockhash }) {
  const owner = address(payer), to = address(recipient), tokenMint = address(mint);
  const signer = createNoopSigner(owner);
  const [source] = await findAssociatedTokenPda({ owner, mint: tokenMint, tokenProgram: TOKEN_PROGRAM_ADDRESS });
  const [destination] = await findAssociatedTokenPda({ owner: to, mint: tokenMint, tokenProgram: TOKEN_PROGRAM_ADDRESS });
  const instructions = [
    // No-op when Naga's token account already exists; creates it otherwise.
    getCreateAssociatedTokenIdempotentInstruction({ payer: signer, ata: destination, owner: to, mint: tokenMint }),
    getTransferCheckedInstruction({ source, mint: tokenMint, destination, authority: signer, amount, decimals }),
    { programAddress: address(MEMO_PROGRAM), accounts: [{ address: owner, role: AccountRole.READONLY_SIGNER }], data: new TextEncoder().encode(memo) },
  ];
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayer(owner, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(blockhash, m),
    (m) => appendTransactionMessageInstructions(instructions, m),
  );
  return new Uint8Array(getTransactionEncoder().encode(compileTransaction(message)));
}
