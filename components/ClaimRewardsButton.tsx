"use client"
import {
  hippodromeAddress,
  claimRewardsFunction,
  rewardsClaimedEvent,
} from "@/lib/hippodrome";
import { useAccount, useWatchContractEvent, useWriteContract } from "wagmi";

type Props = {
  id: number;
};

export default function ClaimRewardsButton({ id }: Props) {
  const { isConnected } = useAccount();
  const { writeContractAsync, isPending, data } = useWriteContract();
  useWatchContractEvent({
    address: hippodromeAddress,
    abi: rewardsClaimedEvent,
    eventName: "RewardsClaimed",
    onLogs(logs) {
      console.log("New logs!", logs);
    },
  });

  return (
    <button
      className="btn btn-primary disabled:bg-primary disabled:text-primary-content"
      onClick={async () =>
        await writeContractAsync({
          abi: claimRewardsFunction,
          address: hippodromeAddress,
          functionName: "claimRewards",
          args: [BigInt(id)],
        })
      }
      disabled={isPending || !isConnected}
    >
      {isPending ? (
        <span className="loading loading-dots loading-md"></span>
      ) : (
        <>Claim rewards</>
      )}
    </button>
  );
}
