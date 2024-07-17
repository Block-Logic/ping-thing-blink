export const runtime = 'edge' // 'nodejs' (default) | 'edge'
import {
  ACTIONS_CORS_HEADERS,
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createPostResponse,
} from "@solana/actions";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const RPC_ENDPOINT =
  process.env.RPC_ENDPOINT || "https://api.mainnet-beta.solana.com";

const RECEIVER_ADDRESS =
  process.env.RECEIVER_ADDRESS || "ping6gwBZx1ccMMFyLgkVSupUmujYrFidEXuNRPq989";

const connection = new Connection(RPC_ENDPOINT, { commitment: "confirmed" });

export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    icon: "https://github.com/Block-Logic/ping-thing-blink/blob/main/public/blinkImage.png?raw=true",
    label: "Donate 0.1 SOL to the Ping Thing",
    description: `Ping Thing allows you to check transaction landing latency on Solana`,
    title: "Support the Ping Thing",
    links: {
      actions: [
        {
          label: "0.5",
          href: "/api/actions/donate?amount=0.5",
        },
        {
          label: "1",
          href: "/api/actions/donate?amount=1",
        },
        {
          label: "3",
          href: "/api/actions/donate?amount=3",
        },
        {
          label: "Donate SOL",
          href: "/api/actions/donate?amount={amount}",
          parameters: [
            {
              name: "amount",
              label: "Enter a custom SOL amount",
            },
          ],
        },
      ],
    },
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
  const url = new URL(req.url!);
  const amount = url.searchParams.get("amount");

  try {
    const body: ActionPostRequest = await req.json();

    let account: PublicKey;

    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response("invalid account provided", {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(account),
        toPubkey: new PublicKey(RECEIVER_ADDRESS!),
        lamports: LAMPORTS_PER_SOL * parseFloat(`${amount}`),
      })
    );

    transaction.feePayer = new PublicKey(account);
    const latestBlockhash = await connection.getLatestBlockhash();

    transaction!.recentBlockhash = latestBlockhash.blockhash;
    transaction!.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

    try {
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      const payload: ActionPostResponse = await createPostResponse({
        fields: {
          transaction,
          message: "Thanks for supporting the Ping Thing",
        },
      });

      return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
    } catch (error) {
      console.log("error", error);
    }
  } catch (err) {
    return Response.json("unkown error", { status: 400 });
  }
};
