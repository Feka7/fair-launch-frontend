"use client";
import { hippodromeAbi, hippodromeAddress } from "@/lib/hippodrome";
import toast from "react-hot-toast";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { config } from "./Web3Provider";

type Props = {
  id: number;
};

export default function ClaimRewardsButton({ id }: Props) {
  const { isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const { data: isResolved, isPending: isPendingResolved } = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "isCampaignResolved",
    args: [BigInt(id)],
  });

  return (
    <button
      className="btn btn-primary disabled:bg-primary disabled:text-primary-content"
      onClick={async () => {
        const tx = await writeContractAsync({
          abi: hippodromeAbi,
          address: hippodromeAddress,
          functionName: "resolveCampaign",
          args: [BigInt(id)],
        });
        const transactionReceipt = await waitForTransactionReceipt(config, {
          hash: tx,
        });
        toast.success(
          <>
            Campaign closed!{" "}
            <a href="#">
              {transactionReceipt.transactionHash.slice(0, 5) +
                "..." +
                transactionReceipt.transactionHash.slice(-5)}
            </a>
          </>
        );
      }}
      disabled={isPending || !isConnected || isPendingResolved || isResolved}
    >
      {isPending ? (
        <span className="loading loading-dots loading-md disabled:bg-primary disabled:text-primary-content"></span>
      ) : (
        <>{isResolved ? <>Closed</> : <>Resolve campaign</>}</>
      )}
    </button>
  );
}
