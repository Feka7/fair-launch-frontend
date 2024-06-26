"use client"
import {
  hippodromeAddress,
  hippodromeAbi
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
    abi: hippodromeAbi,
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
          abi: hippodromeAbi,
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
