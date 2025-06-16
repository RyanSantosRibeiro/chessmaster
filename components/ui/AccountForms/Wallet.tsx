'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function WalletInterface() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'pending'>('deposit');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  const handleTabClick = (tab: 'deposit' | 'withdraw' | 'pending') => {
    setActiveTab(tab);
    setAmount('');
    setAddress('');
  };

  const handleConfirm = () => {
    if (activeTab === 'deposit') {
      // Lógica de depósito aqui
      console.log(`Depositing ${amount} BTC`);
    } else if (activeTab === 'withdraw') {
      // Lógica de saque aqui
      console.log(`Withdrawing ${amount} BTC to ${address}`);
    }
  };

  return (
    <div>
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={() => handleTabClick('deposit')} className={`btn ${activeTab === 'deposit' ? '' : 'btn-neutral'}`}>
            Deposit
          </button>
          <button onClick={() => handleTabClick('withdraw')} className={`btn ${activeTab === 'withdraw' ? '' : 'btn-neutral'}`}>
            Withdraw
          </button>
          <button onClick={() => handleTabClick('pending')} className={`btn ${activeTab === 'pending' ? '' : 'btn-neutral'}`}>
            Pending
          </button>
        </div>
      <div className="mt-6">
        {activeTab === 'deposit' && (
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Options</label>
              <select className="w-full bg-zinc-800 p-2 rounded-md">
                <option>Connected Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Token</label>
              <input disabled value="BTC" className="w-full bg-zinc-800 p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Balance</label>
              <input disabled value="0.00000000 BTC" className="w-full bg-zinc-800 p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount</label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-800 p-2 rounded-md"
              />
              <p className="text-sm text-gray-400 mt-1">Fee: 0.00002010 BTC — Min: 0.0001 BTC</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.015, 0.03, 0.045, 0.09].map((val) => (
                <Button key={val} onClick={() => setAmount(val.toString())} variant="outline">
                  {val}
                </Button>
              ))}
            </div>
            <button className="w-full mt-4 btn btn-primary" onClick={handleConfirm}>
              Confirm Deposit
            </button>
          </form>
        )}

        {activeTab === 'withdraw' && (
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Options</label>
              <select className="w-full bg-zinc-800 p-2 rounded-md">
                <option>External Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Token</label>
              <input disabled value="BTC" className="w-full bg-zinc-800 p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Balance</label>
              <input disabled value="0.00000000 BTC" className="w-full bg-zinc-800 p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Address</label>
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-zinc-800 p-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount</label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-800 p-2 rounded-md"
              />
              <p className="text-sm text-gray-400 mt-1">Fee: 0.00002010 BTC — Min: 0.0005 BTC</p>
            </div>
            <button className="w-full mt-4 btn-primary" onClick={handleConfirm}>
              Confirm Withdraw
            </button>
          </form>
        )}

        {activeTab === 'pending' && (
          <div className="text-center text-gray-400 py-12">No pending transactions</div>
        )}
      </div>
    </div>
  );
}
