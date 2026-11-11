// Offline check: builds a transfer with a fake blockhash and decodes it back.
import assert from 'node:assert/strict';
import { getTransactionDecoder, getCompiledTransactionMessageDecoder, getBase58Decoder } from '@solana/kit';
import { buildUsdcTransfer, toBaseUnits, MEMO_PROGRAM } from './transfer.mjs';

assert.equal(toBaseUnits('1530', 6), 1530000000n);
assert.equal(toBaseUnits('890.5', 6), 890500000n);
assert.equal(toBaseUnits('0.000001', 6), 1n);

const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const bytes = await buildUsdcTransfer({
  payer: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  recipient: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  mint: USDC, decimals: 6, amount: toBaseUnits('1530', 6), memo: 'naga:TEST1234',
  blockhash: { blockhash: 'EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N', lastValidBlockHeight: 1n },
});
const tx = getTransactionDecoder().decode(bytes);
const msg = getCompiledTransactionMessageDecoder().decode(tx.messageBytes);
const keys = msg.staticAccounts.map(String);
const programs = msg.instructions.map((ix) => keys[ix.programAddressIndex]);
assert.equal(programs.length, 3);
assert.ok(programs.includes(MEMO_PROGRAM), 'memo instruction present');
assert.ok(programs.includes('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), 'token program present');
const memoIx = msg.instructions[programs.indexOf(MEMO_PROGRAM)];
assert.equal(new TextDecoder().decode(memoIx.data), 'naga:TEST1234');
const transfer = msg.instructions[programs.indexOf('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')];
assert.equal(transfer.data[0], 12, 'TransferChecked opcode');
const amount = new DataView(transfer.data.buffer, transfer.data.byteOffset).getBigUint64(1, true);
assert.equal(amount, 1530000000n);
assert.equal(transfer.data[9], 6, 'decimals');
assert.equal(keys[0], '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 'payer is fee payer');
console.log('transfer ok:', bytes.length, 'bytes, signatures needed:', Object.keys(tx.signatures).length);
