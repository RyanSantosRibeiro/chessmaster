import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '../Button';
import LoadingDots from '../LoadingDots';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { createMatch, getMatch, getMatchTypes } from '@/utils/supabase/queries';
import { transferToken } from '@/utils/odin/transfer';

const supabase = createClient();

const generateMatchId = () =>
  Math.random().toString(36).substring(2, 6) +
  Date.now().toString(36).substring(2, 6);

export function MatchmakingButtons() {
  const [inQueue, setInQueue] = useState(false);
  const [matchTypes, setMatchTypes] = useState([]);
  const [channel, setChannel] = useState<any>(null);
  const { user, token } = useWallet();
  const router = useRouter();

  const getMatch = async () => {
    const response = await getMatchTypes('queue');
    const result = await response;
    console.log({ queue: result });
    setMatchTypes(result);
  };

  useEffect(() => {
    getMatch();
  }, []);
  useEffect(() => {
   console.log({token})
  }, [token]);

  const joinQueue = async (type: number) => {
    if (!user) return;
    setInQueue(true);
    let hasMatched = false;

    // @ts-ignore
    const matchmakingChannel = supabase.channel(`matchmaking-${type.ticket_amount}`, {
      config: {
        presence: { key: user.id }
      }
    });

    const cleanup = async () => {
      try {
        await matchmakingChannel.unsubscribe();
        setInQueue(false);
        setChannel(null);
      } catch (err) {
        console.error('Erro ao sair da fila:', err);
      }
    };
    console.log('Joined in queue');
    matchmakingChannel
      .on('presence', { event: 'sync' }, async () => {
        const state = matchmakingChannel.presenceState();
        if (hasMatched) return;
        const others = Object.entries(state)
          .filter(([id]) => id !== user.id)
          .map(([_, presences]) => presences[0]);
        console.log({ others });

        const match = others.find(
          (p) =>
            // @ts-ignore
            Math.abs(p.trophies - user.trophies) <= 200
        );

        console.log({ match });

        if (match) {
          console.log('Match!!');
          hasMatched = true;
          // @ts-ignore
          let isUserWhite = null;

          // @ts-ignore
          if (user.trophies == match.trophies) {
            // @ts-ignore
            isUserWhite = user.id > match.user_id;

            console.log({
              s: 'São iguais',
              isUserWhite,
              u: user.id,
              // @ts-ignore
              m: match.user_id
            });
          } else {
            // @ts-ignore
            isUserWhite = user.trophies < match.trophies;
          }
          // @ts-ignore
          const white_player_id = isUserWhite ? user.id : match.user_id;
          // @ts-ignore
          const black_player_id = isUserWhite ? match.user_id : user.id;
          const isResponsible = white_player_id ==  user.id;
          const matchId = generateMatchId();
          console.log('🟢 Responsavel ', isResponsible);

          if (isResponsible) {
            try {
              console.log('🟢🟢 Criando partida 🟢🟢');
              //  devtransfer Aqui transfere os tokens ou la no back com o createMatch em api/match/route.js
              // user.odinData
              const payment = await transferToken(
                user.odinData,
                'htsfw-sunm3-lieuo-3gmbn-sogv4-ics5w-zz3ch-ubtpb-rfxxz-q2ufn-wqe',
                '2k6r',
                // @ts-ignore
                type.ticket_amount // 0,000085 -> 8500000
              );

              if(!payment.success) throw payment;

              const reponse = await createMatch({
                url_hash: matchId,
                white_player_id,
                black_player_id,
                // @ts-ignore
                match_type: type.id
              });

              console.log({ reponse });
              if (!reponse.success) return; // PM - Algum erro ao criar partida

              localStorage.setItem('currentMatch', reponse.data[0]);

              await matchmakingChannel.send({
                type: 'broadcast',
                // @ts-ignore
                event: `match-found-${match.code}`,
                payload: {
                  matchId,
                  // @ts-ignore
                  players: [user.id, match.user_id]
                }
              });

              await cleanup();
              console.log('Redirecionando');

              window.location.replace(`/play/${matchId}`);
            } catch (err) {
              console.error('Erro ao criar partida:', err);
              await cleanup();
            }
          }
        }
      })
      .on(
        'broadcast',
        { event: `match-found-${user.username}` },
        async ({ payload }) => {
          const { matchId, players } = payload;
          console.log('Recebeu broadcast de match:', matchId, players);

          if (!players.includes(user.id)) return; // Ignora se não for pra You
          await cleanup();
          console.log('🟢🟢 broadcast - Partida encontrada 🟢🟢');
          window.location.replace(`/play/${matchId}`);
        }
      )
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('🟢 JOIN:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('🔴 LEAVE:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await matchmakingChannel.track({
            code: user.username,
            user_id: user.id,
            trophies: user.trophies
          });
        }
      });

    setChannel(matchmakingChannel);
  };

  const leaveQueue = async () => {
    if (channel) {
      await channel.untrack();
      await channel.unsubscribe();
    }
    setChannel(null);
    setInQueue(false);
  };

  const bg = ['#2cb1c3', '#d65729', '#cc6d70'];

  return (
    <div className="space-y-4 flex flex-col w-full">
      {!inQueue ? (
        <div className="flex gap-2 w-full flex flex-col">
          {matchTypes.length > 0 &&
            matchTypes.map((type, index) => {
              // @ts-ignore
              const price = type?.ticket_amount * token?.priceDolar;

              return (
                <button
                  key={index}
                  onClick={() => joinQueue(type)}
                  style={{ backgroundColor: bg[index] || '#89e0eb' }}
                  className="btn btn-xl gap-0 group relative overflow-hidden transition-all duration-150 py-2 rounded px-2 cursor-pointer w-full flex flex-col items-start justify-between pearl"
                >
                  <p className="m-0 text-lg font-bold text-left">
                    {/* @ts-ignore */}
                    {type?.ticket_amount} Aurions
                  </p>
                  <p className="m-0 text-[10px] text-[#dbdbdb]">~= ${price.toFixed(2)} Usd</p>

                  <span
                    className="
                    absolute 
                    right-[-20%] 
                    group-hover:right-[5%] 
                    group-hover:opacity-40 
                    transition-all 
                    duration-300 
                    text-5xl 
                    font-bold 
                    italic 
                    opacity-10
                  "
                  >
                    {/* @ts-ignore */}
                    {type?.experience}
                  </span>
                </button>
              );
            })}
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">
            Searching for opponent <LoadingDots />
          </p>
          <Button onClick={leaveQueue}>Cancel</Button>
        </div>
      )}
    </div>
  );
}
