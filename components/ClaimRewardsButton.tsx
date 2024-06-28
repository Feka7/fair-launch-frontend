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
  const { refetch: refetchRewardStatus } = useReadContract(
    {
      abi: hippodromeAbi,
      address: hippodromeAddress,
      functionName: "getUserRewardStatus",
      args: [BigInt(id), address!],
    }
  );
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
      refetchRewardStatus();
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
  const allowedClaim = !value
    ? false
    : avaiableRewards
    ? avaiableRewards >= parseUnits(value, 6)
    : false;
  return (
    <>
      <button
        className="btn btn-primary btn-xs"
        onClick={() => handleClaim()}
        disabled={loading || !allowedClaim}
      >
        {loading ? (
          <span className="loading loading-dots loading-md disabled:bg-primary disabled:text-primary-content"></span>
        ) : (
          <>Claim</>
        )}
      </button>
    </>
  );
}
