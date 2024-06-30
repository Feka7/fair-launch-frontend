"use client";
import { hippodromeAbi, hippodromeAddress } from "@/lib/hippodrome";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { ContractFunctionExecutionError, formatUnits, parseUnits } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import Symbol from "./Symbol";
import { config } from "./Web3Provider";

type Props = {
  id: number;
};

export default function ClaimRewardsButton({ id }: Props) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [value, setValue] = useState<string>("");
  const [loading, isLoading] = useState<boolean>(false);
  const {
    data: isResolved,
    isPending: isPendingResolved,
    refetch,
  } = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "isCampaignResolved",
    args: [BigInt(id)],
  });
  const { data: avaiableRewards, refetch: refetchAvaiableRewards } =
    useReadContract({
      abi: hippodromeAbi,
      address: hippodromeAddress,
      functionName: "getAvailableUserRewards",
      args: [address!, BigInt(id)],
    });

  const handleClaim = async () => {
    if (value === "0") return;
    try {
      isLoading(true);
      const tx = await writeContractAsync({
        address: hippodromeAddress,
        abi: hippodromeAbi,
        functionName: "claimRewards",
        args: [BigInt(id)],
      });
      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash: tx,
      });
      refetchAvaiableRewards();
      toast.success(
        <>
          Rewards claimed!{" "}
          <a href="#">
            {transactionReceipt.transactionHash.slice(0, 5) +
              "..." +
              transactionReceipt.transactionHash.slice(-5)}
          </a>
        </>
      );
    } catch (e) {
      if (e instanceof ContractFunctionExecutionError) {
        console.log(e.message);
        toast.error(e.shortMessage);
      }
    } finally {
      isLoading(false);
      setValue("");
    }
  };
  if (isPendingResolved)
    return <div className="w-20 h-10 rounded-xl skeleton"></div>;

  if (!isResolved)
    return <button className="btn btn-sm btn-disabled">Claim</button>;

  if (Number(avaiableRewards) > 0)
    return (
      <button
        className="btn btn-primary btn-sm disabled:bg-primary disabled:text-primary-content"
        onClick={() => handleClaim()}
        disabled={loading}
      >
        {loading ? (
          <span className="loading loading-dots loading-md"></span>
        ) : (
          <>Claim</>
        )}
      </button>
    );
  return (
    <>
      <button className="btn btn-disabled btn-sm">Claimed</button>
    </>
  );
}
