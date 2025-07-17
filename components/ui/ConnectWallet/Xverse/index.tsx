"use client";
import { useEffect, useState } from "react";
import SignClient from "@walletconnect/sign-client";
import QRCodeModal from "@walletconnect/qrcode-modal";

export default function ConnectXverse() {
  const [signClient, setSignClient] = useState<SignClient | null>(null);
  const [session, setSession] = useState<any>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    
    const initializeSignClient = async () => {
      try {
        const client = await SignClient.init({
          projectId: "YOUR_PROJECT_ID", // obtenha no https://cloud.walletconnect.com
          metadata: {
            name: "XadrezBet",
            description: "Xadrez com apostas",
            url: "https://seusite.com",
            icons: ["https://seusite.com/icon.png"],
          },
        });

        client.on("session_event", (event) => {
          console.log("session_event", event);
        });

        client.on("session_update", ({ topic, params }) => {
          console.log("session_update", params);
          setSession((prev: any) => ({
            ...prev,
            namespaces: params.namespaces,
          }));
        });

        client.on("session_delete", () => {
          console.log("session deleted");
          setConnected(false);
          setSession(null);
          setAccounts([]);
        });

        setSignClient(client);
      } catch (e) {
        console.error("Erro ao inicializar SignClient", e);
      }
    };

    initializeSignClient();
  }, []);

  const connectWallet = async () => {
    if (!signClient) return;

    try {
      const { uri, approval } = await signClient.connect({
        requiredNamespaces: {
          btc: {
            methods: ["btc_sendTransaction"],
            chains: ["btc:1"],
            events: ["accountsChanged"],
          },
        },
      });

      if (uri) {
        QRCodeModal.open(uri, () => {
          console.log("QRCode modal fechado");
        });
      }

      const sessionNamespace = await approval();
      console.log("aprovado", sessionNamespace);

      setSession(sessionNamespace);
      setConnected(true);

      const btcAccounts = sessionNamespace.namespaces.btc.accounts;
      setAccounts(btcAccounts);

      QRCodeModal.close();
    } catch (err) {
      console.error("Erro ao conectar", err);
    }
  };

  const disconnectWallet = async () => {
    if (signClient && session) {
      await signClient.disconnect({
        topic: session.topic,
        reason: {
          code: 6000,
          message: "Usuário desconectou",
        },
      });
      setSession(null);
      setConnected(false);
      setAccounts([]);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-sm font-bold">Connect on Xverse (WalletConnect v2)</h2>
      {connected && accounts.length > 0 ? (
        <div>
          <p className="text-green-600 break-all">
            Wallet: {accounts[0]}
          </p>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Desconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 rounded-lg p-4 overflow-hidden inset-0 bg-gradient-to-r from-primary/10 to-secondary/10"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
