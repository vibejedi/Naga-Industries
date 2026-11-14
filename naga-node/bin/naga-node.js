#!/usr/bin/env node
// naga-node: the command line. `naga-node run` starts the dashboard; the rest are one-shot commands.
import readline from 'node:readline';
import { NagaNode } from '../src/agent.js';
import { createServer } from '../src/server.js';
import { home } from '../src/config.js';

const HELP = `naga-node <command>

  run        Start the node and its dashboard (http://127.0.0.1:4747)
  init       Create this laptop's wallet and show the recovery phrase once
  status     Show where this laptop stands on peaqOS
  preview    Quote the bond for activating this laptop. Sends nothing
  activate   Activate this laptop on peaqOS (one transaction, asks first)
  on         Turn Naga Node on: opt in and start the heartbeat (stays running)
  off        Turn Naga Node off: stop and opt out
  phrase     Show the recovery phrase again

The passphrase is read from NAGA_NODE_PASSPHRASE or asked for. Files live in ${home()}.`;

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) rl._writeToOutput = (s) => { if (s.includes(question)) rl.output.write(question); };
    rl.question(question, (answer) => { rl.close(); if (hidden) process.stdout.write('\n'); resolve(answer); });
  });
}
const passphrase = async (prompt = 'Passphrase: ') => process.env.NAGA_NODE_PASSPHRASE || ask(prompt, true);
const show = (o) => console.log(JSON.stringify(o, null, 2));

const cmd = process.argv[2];
const node = new NagaNode();

try {
  if (cmd === 'init') {
    const p = await passphrase('Choose a passphrase (8 characters or more): ');
    const r = node.setup(p);
    console.log('\nRecovery phrase. Write it on paper now. Anyone who has it controls this laptop\'s wallet,\nand without it a wiped drive loses the wallet for good:\n\n  ' + r.mnemonic + '\n');
    show(r.addresses);
  } else if (cmd === 'status') {
    if (node.snapshot().hasWallet) await node.unlock(await passphrase()).catch((e) => console.error(e.message));
    show(node.snapshot()); node.lock();
  } else if (cmd === 'preview') {
    await node.unlock(await passphrase()); show(await node.preview()); node.lock();
  } else if (cmd === 'activate') {
    await node.unlock(await passphrase());
    const q = await node.preview(); show(q);
    if (!q.ready) throw new Error('Send ' + q.shortfall + ' PEAQ to ' + node.snapshot().addresses.peaq + ' on peaq, then run this again.');
    const yes = process.argv.includes('--yes') || /^y(es)?$/i.test(await ask('Bond ' + q.net + ' PEAQ and activate this laptop? The bond cannot be withdrawn. (y/n) '));
    if (!yes) throw new Error('Nothing was sent.');
    show(await node.activate()); node.lock();
  } else if (cmd === 'on' || cmd === 'run') {
    const { url } = await createServer(node);
    console.log('Naga Node dashboard: ' + url);
    if (node.snapshot().hasWallet && (process.env.NAGA_NODE_PASSPHRASE || cmd === 'on')) {
      await node.unlock(await passphrase());
      if (cmd === 'on') show(await node.switchOn());
    }
    const stop = () => { node.lock(); process.exit(0); };   // the heartbeat stops; peaq marks the laptop offline by itself
    process.on('SIGINT', stop); process.on('SIGTERM', stop);
  } else if (cmd === 'off') {
    await node.unlock(await passphrase()); show(await node.switchOff()); node.lock();
  } else if (cmd === 'phrase') {
    console.log(node.phrase(await passphrase()));
  } else {
    console.log(HELP); process.exitCode = cmd && cmd !== 'help' && cmd !== '--help' ? 1 : 0;
  }
} catch (e) {
  console.error('naga-node: ' + String((e && (e.shortMessage || e.message)) || e).split('\n')[0]);
  process.exit(1);
}
