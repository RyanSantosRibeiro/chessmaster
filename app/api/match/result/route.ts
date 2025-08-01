import { transferToken } from '@/utils/odin/transfer';
import { createClientAdmin } from '@/utils/supabase/client';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  const body = await req.json();
  const { winner_id, match, fen, status, completed_at } = body;
  console.log({ winner_id, match, fen, status, completed_at });

  if (!winner_id || !match || !fen || !completed_at || !status)
    return NextResponse.json({ error: 'Not enough data' }, { status: 402 });

  const supabase = createClientAdmin();

  const { data: verifyMatch, error: verifyMatchError } = await supabase
    .from('matches')
    .select(
      `
    *,
    white_player:users!matches_white_player_id_fkey (*),
    black_player:users!matches_black_player_id_fkey (*),
    match_type:matches_type!matches_match_type_fkey (*)
  `
    )
    .eq('id', match)
    .eq('status', 'in_progress')
    .single();

  console.log({ verifyMatch });

  if (verifyMatchError) {
    return new Response(
      JSON.stringify({
        success: false,
        message: verifyMatchError
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const winner =
    winner_id == verifyMatch.white_player.id
      ? verifyMatch.white_player
      : verifyMatch.black_player;
  const loser =
    winner_id == verifyMatch.white_player.id
      ? verifyMatch.black_player
      : verifyMatch.white_player;

  const { data, error } = await supabase
    .from('matches')
    .update({
      winner_id: winner_id,
      fen,
      status,
      completed_at: new Date().toISOString()
    })
    .eq('id', match);

  const { data: winnerPLayer, error: winnerPlayerError } = await supabase
    .from('users')
    .update({
      trophies: winner.trophies + verifyMatch.match_type.trophies_on_win
    })
    .eq('id', winner.id);

  const { data: loserPLayer, error: loserPlayerError } = await supabase
    .from('users')
    .update({
      trophies: loser.trophies - verifyMatch.match_type.trophies_on_win
    })
    .eq('id', loser.id);

  const odinPlataform = {
    userPrincipal:
      '4rqr4-35yv3-j74z2-3hqq3-wfpmo-xnbfl-xipye-zbfqy-w2bxi-h77pv-sae',
    publicKey:
      'dc48db06e53f0b767a8acc7ea76255a85a9292e82eba981f267de8ce5f1c846c',
    privateKey:
      '8df4e8f9a63878652e7e0f9224ee5faa442946145313f22365d8042854e2b8b1',
    delegationChain: {
      delegations: [
        {
          delegation: {
            expiration: '1857ce5c95414ac2',
            pubkey:
              '302a300506032b6570032100dc48db06e53f0b767a8acc7ea76255a85a9292e82eba981f267de8ce5f1c846c',
            targets: []
          },
          signature:
            'd9d9f7a26b6365727469666963617465590686d9d9f7a364747265658301830183018204582047075bfe62e9f480c2c5df088f6418afe758669d9a3b6c143c6cc51f2ff7e75d83024863616e6973746572830183018204582090b4ea005c2fce616746c72c6fc12ad6eae1bddfda1d8eff46d3f46b43a37ce4830182045820847c0704249d79f06a21257aca40404d0a4aca7973b878bb8be4302a51969a838301820458203858dd145796c17de3b6be17b9528e0770391d013159605defb85ded967ae1f5830183018301820458207a7ae86daf8eb14646c8538dde00ca328420aaad6b14b6b467e06dc810f8535683018301830182045820984dc8ffa6132f7fb01c857f93ff6f3f82a73e381ac6685d9e77c50f496b4d8583018301820458202c99a60d7f4fe5a5dbc50d5532ceaced259aa2d8ef41b7bf58e69660a081fc9a8301830183018301820458207cab6c11651cff34e6787679dddaeb3c885b73d1fd905ff5e35004be8ac8966a83024a00000000015074c201018301830183024e6365727469666965645f64617461820358200165341e673298dda4021b5a0660449229c56e606f9fc344a02bfb3296b8e42b820458209d2251cd890ea79950c96687a3b0516e6dfe6a8a6ad3bd864b3a54669785ddd9820458203fe58d788cee80ee1e9da4c16ea2cb85f61c828d7e0bb2d3605922b15c3cefed82045820d9d363ba20a7c64388d80b92fb259fe31fbe0e4251659fce04578918fce5f67382045820d2b7cbffaac030c69a1c3d98fca994feb13b4ffff036a3dbd855740282e6757382045820846dd8f1709110aa3fb868bf1e2d0233b96287648e8280c94cb2b6ca5093d456820458207b6b00fe1ed15030dc0304d19f0e81d21bbc5591ad437710faad5a39ac72d47c82045820ef5ae299454f2b0b1d6e2a76f0d71fb7dee5e19156afd25d51fcd56c5c8ae0ef82045820c4b99fd2e75bd8a198093bf31e99d00d8b2adac024f86f1a29346c2a69f2bf0682045820ca79ed3664a08246b80c1c76319ebd824ab075834f4d4e0c197de267fc39d92e82045820335469ece7d9c0fee387be5feca9573bb57af602a266b3b86372b6d2bde035ed820458204cc3dca93a63824b65c658238e5123d0f73d9808b4a4ee80f677a0c2b388bb6382045820aeaf4944366aeb8f92af8e24f00cd4e24774ddfec3a8ad5bbb953f87fd610c29830182045820f7f86030882ad479eaed5e5e9a1b94e9d65b64665f5aafef2768b05ec0528c1283024474696d6582034997d099dbd2a6ccab18697369676e61747572655830a17f3be018c9576ed8c25534710a6f8f99cda0627c0e82ab01c70601f47146bc40eb20040d9be4ab063a81d8cda6593c6a64656c65676174696f6ea2697375626e65745f6964581d12790e7661fccd3d4fc83138dcaffd9f188e867b45ae10c8836dd0b8026b636572746966696361746559027dd9d9f7a2647472656583018204582018402f0090a5c264049579d77bb71202da6ab478c7b3c7d097798c4cb4754e0483018301820458206b52d93d3f79600f2e4063b39cd32456b70f9a5446a2c1112430156d4cf89be08302467375626e6574830183018301830182045820794d50b5b96f1b0b1b3ab15814cfaab3e151d67660d4ce49b54c6b4010c53f18830183018302581d12790e7661fccd3d4fc83138dcaffd9f188e867b45ae10c8836dd0b802830183024f63616e69737465725f72616e6765738203581bd9d9f781824a000000000150000001014a00000000015fffff010183024a7075626c69635f6b657982035885308182301d060d2b0601040182dc7c0503010201060c2b0601040182dc7c0503020103610086d88ebbd2f1663e65d3a3ff07e8ee9fa420d08b9a6822919f224b8b802d5d9be150dc493f84c23e73a0cc1d2c2ee28709ff140000128fcd5dfbd7b457ef3af344766d7ff0924fe7a7f456ded77ca6de3b1b406b710c4eaed7287ab9a352766982045820c9aa916496d6749de97b8f2820e7a758f390374226d1ec20d5b1a596e12e68e882045820b40e227642ef6656314df078864e106b4fdb9ae6ea70cb9193cdc1ce9a7ea37982045820831115d9d082f6bbc4e1e1e02d051d147f7b49a6fbb7027878ec12ae9b50b48982045820afaa8832101bcee23eb871f6a3b372b927eb3ad5bacbbbf67aa4df296bf8c49382045820c5ae5ff2ee6f3e5eda8a27b70f10776e2de31882cbd44e547e3b56bc73149fb183024474696d6582034985ee89d8c4a0ccab18697369676e6174757265583088d8a0acba3027433018ec30187f19316c8b302daa49ba84063bf9a31eeb388c45ace6ac3b4146df5575d830fcc3b3166474726565830182045820d95dda092d572612004d667c45b8af823f31077ba10e1e65c9e63131e4c3f1e0830243736967830183018301820458204a355a40a418d5f5561d8e959244718ce0f898d7bf5ffcd4c7b3215a5377c7fa83018204582045f552337b08f1408622de3b503708f225df5fcdb453785e24352d4e5350785c8302582010cc8b303e41cbda3bfcf53ad5199afe3b6f4b32c5bbdd96794bce3a93db0746830258207dbf37bf15b4a6fad89dc6f0d584553107086e562e4f208c414402e3f41f5fa3820340820458204f904b90783bc2568e9ab2c054ea0310dbcff8e0a43d796d6c7c2f99bb62289b82045820dc2d153fd148b21e4dc438120601baa41022de5a5de424d583403b82f002eaea'
        }
      ],
      publicKey:
        '303c300c060a2b0601040183b8430102032c000a00000000015074c201015065470ef1a7aa4dd67c96dae6ee303025106efa2c7b88a5d6f5d3e34ad27e27'
    },
    sessionIdentity: [
      '8df4e8f9a63878652e7e0f9224ee5faa442946145313f22365d8042854e2b8b1',
      '302a300506032b6570032100dc48db06e53f0b767a8acc7ea76255a85a9292e82eba981f267de8ce5f1c846c'
    ]
  };
  // console.log({odinPlataform})
  const reward = verifyMatch.match_type.ticket_amount * 2 * 0.8;

  console.log({ reward, verifyTicket: verifyMatch.match_type.ticket_amount });

  const payment = await transferToken(
    odinPlataform,
    winner.odinData.userPrincipal,
    '2k6r',
    reward // 0,000085 -> 8500000
  );

  if (!payment.success) throw payment;

  if (winnerPlayerError || loserPlayerError) {
    return new Response(
      JSON.stringify({
        success: false,
        message: { winnerPlayerError, loserPlayerError }
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Match updated',
      data
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
