"use client";
import {
  fusdcAddress,
  hippodromeAbi,
  hippodromeAddress,
} from "@/lib/hippodrome";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  ContractFunctionExecutionError,
  erc20Abi,
  formatUnits,
  parseUnits,
} from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "./Web3Provider";

export default function AddFundsModal({ id }: { id: number }) {
  const account = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [value, setValue] = useState<string>("");
  const [loading, isLoading] = useState<boolean>(false);
  const { data, refetch } = useReadContract({
    abi: erc20Abi,
    address: fusdcAddress,
    functionName: "balanceOf",
    args: [account.address!],
  });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: fusdcAddress,
    functionName: "allowance",
    args: [account.address!, hippodromeAddress],
  });
  const { refetch: refetchCampaign } = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "getCampaign",
    args: [BigInt(id)],
  });
  const ref = useRef<HTMLDialogElement>(null);
  const handlePerc = (perc: number) => {
    if (data) {
      setValue((Number(formatUnits(data, 6)) * perc).toString());
    }
  };

  const handleDeposit = async () => {
    if (value === "0") return;
    try {
      isLoading(true);
      const tx = await writeContractAsync({
        address: hippodromeAddress,
        abi: hippodromeAbi,
        functionName: "fundCampaign",
        args: [BigInt(id), parseUnits(value, 6)],
      });
      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash: tx,
      });
      refetch();
      refetchCampaign();
      toast.success(
        <>
          Funds deposited!{" "}
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
  const handleApprove = async () => {
    if (value === "0") return;
    try {
      isLoading(true);
      const tx = await writeContractAsync({
        address: fusdcAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [hippodromeAddress, parseUnits(value, 6)],
      });
      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash: tx,
      });
      refetchAllowance();
    } catch (e) {
      if (e instanceof ContractFunctionExecutionError) {
        console.error(e.message);
        toast.error(e.shortMessage);
        ref.current?.close();
      }
    } finally {
      isLoading(false);
    }
  };
  const allowedDeposit = !value
    ? false
    : allowance
    ? allowance >= parseUnits(value, 6)
    : false;
  return (
    <>
      <button className="btn" onClick={() => ref.current?.showModal()}>
        Add
      </button>
      <dialog ref={ref} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Add funds</h3>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text"></span>
              <span className="label-text">
                Balance: {data ? formatUnits(data, 6) : "-"} fUSDC
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
            {allowedDeposit ? (
              <button
                className="btn btn-primary w-full"
                onClick={() => handleDeposit()}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-dots loading-md disabled:bg-primary disabled:text-primary-content"></span>
                ) : (
                  <>Deposit</>
                )}
              </button>
            ) : (
              <button
                className="btn btn-primary w-full"
                onClick={() => handleApprove()}
                disabled={loading || !value}
              >
                {loading ? (
                  <span className="loading loading-dots loading-md disabled:bg-primary disabled:text-primary-content"></span>
                ) : (
                  <>Approve</>
                )}
              </button>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
