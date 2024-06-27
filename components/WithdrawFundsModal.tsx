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
  
  export default function WithdrawFundsModal({ id }: { id: number }) {
    const account = useAccount();
    const { writeContractAsync } = useWriteContract();
    const [value, setValue] = useState<string>("");
    const [loading, isLoading] = useState<boolean>(false);
    const { data, isPending, refetch } = useReadContract({
      abi: hippodromeAbi,
      address: hippodromeAddress,
      functionName: "getUserStake",
      args: [account.address!, BigInt(id)],
    });
    const { refetch: refetchCampaign } = useReadContract({
      abi: hippodromeAbi,
      address: hippodromeAddress,
      functionName: "getCampaign",
      args: [BigInt(id)],
    })
    const { refetch: refetchBalance } = useReadContract({
      abi: erc20Abi,
      address: fusdcAddress,
      functionName: "balanceOf",
      args: [account.address!],
    });
    const ref = useRef<HTMLDialogElement>(null);
    const handlePerc = (perc: number) => {
      if (data) {
        setValue((Number(formatUnits(data, 6)) * perc).toString());
      }
    };
  
    const handleWithdraw = async () => {
      if (value === "0") return;
      try {
        isLoading(true);
        const tx = await writeContractAsync({
          address: hippodromeAddress,
          abi: hippodromeAbi,
          functionName: "withdrawFunds",
          args: [BigInt(id), parseUnits(value, 6)],
        });
        const transactionReceipt = await waitForTransactionReceipt(config, {
          hash: tx,
        });
        refetch();
        refetchBalance();
        refetchCampaign();
        toast.success(
          <>
            Funds withdrawed!{" "}
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
          ref.current?.close();
        }
      } finally {
        isLoading(false);
        ref.current?.close();
        setValue("");
      }
    };
    const allowedWithdraw = !value
      ? false
      : data
      ? data >= parseUnits(value, 6)
      : false;
    return (
      <>
        <button className="btn" onClick={() => ref.current?.showModal()}>
          Withdraw
        </button>
        <dialog ref={ref} className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Withdraw funds</h3>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text"></span>
                <span className="label-text">
                  Deposited: {isPending ? "-" : data ? formatUnits(data, 6) : "0"} sUSDC
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
                  onClick={() => handleWithdraw()}
                  disabled={loading || !allowedWithdraw}
                >
                  {loading ? (
                    <span className="loading loading-dots loading-md disabled:bg-primary disabled:text-primary-content"></span>
                  ) : (
                    <>Withdraw</>
                  )}
                </button>
            </div>
          </div>
        </dialog>
      </>
    );
  }
  