// Privy wallet connect + USDC payment on Solana, as a tiny API for the static site:
//   const pay = await import('assets/vendor/privy-pay.js');
//   await pay.init({ appId, rpcUrl, theme });
//   const { signature, from } = await pay.payUsdc({ recipient, mint, amount, decimals, memo });
// React and Privy render only Privy's own modals; the site keeps its own UI.
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { PrivyProvider, usePrivy, useLogin } from '@privy-io/react-auth';
import { useWallets, useSignAndSendTransaction, toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { createSolanaRpc, createSolanaRpcSubscriptions, getBase58Decoder } from '@solana/kit';
import { buildUsdcTransfer, toBaseUnits } from './transfer.mjs';

const state = { ready: false, authenticated: false, wallets: [], login: null, send: null, logout: null, error: null };
let waiters = [];
let rpc = null;
const notify = () => { waiters = waiters.filter((w) => !w()); };
const when = (pred, ms = 180000) => new Promise((resolve, reject) => {
  if (pred()) return resolve();
  const timer = setTimeout(() => reject(new Error('Wallet connection timed out.')), ms);
  waiters.push(() => {
    if (state.error) { clearTimeout(timer); const e = state.error; state.error = null; reject(e); return true; }
    if (pred()) { clearTimeout(timer); resolve(); return true; }
    return false;
  });
});

function Bridge() {
  const { ready, authenticated, logout } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { login } = useLogin({
    onComplete: () => notify(),
    onError: (err) => { state.error = new Error(err === 'exited_auth_flow' ? 'Wallet connection was cancelled.' : 'Wallet connection failed (' + err + ').'); notify(); },
  });
  Object.assign(state, { ready: ready && walletsReady, authenticated, wallets, login, send: signAndSendTransaction, logout });
  useEffect(() => { notify(); });
  return null;
}

let started = null;
export function init({ appId, rpcUrl, theme = 'dark', logo }) {
  if (started) return started;
  rpc = createSolanaRpc(rpcUrl);
  const host = document.createElement('div');
  host.id = 'naga-privy';
  document.body.appendChild(host);
  createRoot(host).render(
    <PrivyProvider
      appId={appId}
      config={{
        appearance: { theme, accentColor: '#00D9F5', walletChainType: 'solana-only', logo, landingHeader: 'Pay with crypto' },
        loginMethods: ['wallet', 'email'],
        embeddedWallets: { solana: { createOnLogin: 'users-without-wallets' }, ethereum: { createOnLogin: 'off' } },
        externalWallets: { solana: { connectors: toSolanaWalletConnectors() } },
        solana: { rpcs: { 'solana:mainnet': { rpc, rpcSubscriptions: createSolanaRpcSubscriptions(rpcUrl.replace(/^http/, 'ws')) } } },
      }}
    >
      <Bridge />
    </PrivyProvider>,
  );
  started = when(() => state.ready, 30000);
  return started;
}

export async function payUsdc({ recipient, mint, amount, decimals, memo, chain = 'solana:mainnet' }) {
  await started;
  if (!state.authenticated || !state.wallets.length) {
    state.login();
    await when(() => state.authenticated && state.wallets.length > 0);
  }
  // Prefer a wallet the visitor brought (Phantom, Solflare, Backpack) over a Privy embedded one.
  const wallet = state.wallets.find((w) => !/privy/i.test(w.standardWallet?.name || '')) || state.wallets[0];
  const { value } = await rpc.getLatestBlockhash().send();
  const transaction = await buildUsdcTransfer({
    payer: wallet.address, recipient, mint, decimals, memo, blockhash: value,
    amount: toBaseUnits(amount, decimals),
  });
  const { signature } = await state.send({ transaction, wallet, chain });
  return { signature: getBase58Decoder().decode(signature), from: wallet.address };
}

export const logout = () => state.logout && state.logout();
