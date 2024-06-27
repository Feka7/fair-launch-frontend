"use client"
import {
  hippodromeAbi,
  hippodromeAddress
} from "@/lib/hippodrome";
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
  const { data: rewardsStatus, refetch: refetchRewardStatus } = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "getUserRewardStatus",
    args: [BigInt(id), address!],
  });
  const { data: avaiableRewards, refetch: refetchAvaiableRewards } = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "getAvailableUserRewards",
    args: [address!, BigInt(id)],
  });
  const ref = useRef<HTMLDialogElement>(null);
  const handlePerc = (perc: number) => {
    if (avaiableRewards) {
      setValue((Number(formatUnits(avaiableRewards, 18)) * perc).toString());
    }
  };

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
      ref.current?.close();
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
      <button className="btn" onClick={() => ref.current?.showModal()}>
        Claim
      </button>
      <dialog ref={ref} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Claim Rewards</h3>
          <p className="">Total earned: {rewardsStatus ? formatUnits(rewardsStatus[0], 18) : "0"} <Symbol id={id}/></p>
          <p>Claimed: {rewardsStatus ? formatUnits(rewardsStatus[1], 18) : "0"} <Symbol id={id}/></p>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text"></span>
              <span className="label-text">
                Available: {avaiableRewards ? formatUnits(avaiableRewards, 18) : "0"} <Symbol id={id}/>
              </span>
            </div>
            <input
              type="number"
              placeholder="Type here"
              className="input input-bordered w-full"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div className="label">
              <span className="label-text"></span>
              <span className="join">
                <button
                  className="btn btn-xs join-item"
                  onClick={() => handlePerc(0.25)}
                >
                  25%
                </button>
                <button
                  className="btn btn-xs join-item"
                  onClick={() => handlePerc(0.5)}
                >
                  50%
                </button>
                <button
                  className="btn btn-xs join-item"
                  onClick={() => handlePerc(1)}
                >
                  100%
                </button>
              </span>
            </div>
          </label>
          <div className="modal-action">
              <button
                className="btn btn-primary w-full"
                onClick={() => handleClaim()}
                disabled={loading || !allowedClaim}
              >
                {loading ? (
                  <span className="loading loading-dots loading-md disabled:bg-primary disabled:text-primary-content"></span>
                ) : (
                  <>Claim</>
                )}
              </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
