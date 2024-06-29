"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { hippodromeAbi, hippodromeAddress } from "@/lib/hippodrome";
import NoAccount from "@/components/NoAccount";
import {
  ContractFunctionExecutionError,
  erc20Abi,
  formatUnits,
  isHex,
  parseUnits,
} from "viem";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/components/Web3Provider";
import { twMerge } from "tailwind-merge";
import toast from "react-hot-toast";
import Image from "next/image";

export default function Page() {
  const account = useAccount();

  if (!account.address)
    return (
      <>
        <NoAccount />
      </>
    );

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">New campaign</h2>
        <CreateCampaignForm />
      </div>
    </>
  );
}

function CreateCampaignForm() {
  const { address } = useAccount();
  const ref = useRef<HTMLDialogElement>(null);
  const { writeContractAsync } = useWriteContract();
  const [poolSupply, setPoolSupply] = useState<string>("");
  const [startTimestamp, setStartTimestamp] = useState<string>("");
  const [endTimestamp, setEndTimestamp] = useState<string>("");
  const [unvestingStreamStart, setUnvestingStreamStart] = useState<string>("");
  const [unvestingStreamEnd, setUnvestingStreamEnd] = useState<string>("");
  const [rewardSupply, setRewardSupply] = useState<string>("");
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [allowance, setAllowance] = useState<number>(0);
  const [loading, isLoading] = useState<boolean>(false);
  const [tx, setTx] = useState<string>("");
  const totalSupplyRequired = parseFloat(poolSupply) + parseFloat(rewardSupply);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    const isValid = Boolean(
      poolSupply &&
        startTimestamp &&
        endTimestamp &&
        unvestingStreamStart &&
        unvestingStreamEnd &&
        rewardSupply &&
        tokenAddress &&
        name &&
        description &&
        file
    );
    setIsFormValid(isValid);
  }, [
    poolSupply,
    startTimestamp,
    endTimestamp,
    unvestingStreamStart,
    unvestingStreamEnd,
    rewardSupply,
    tokenAddress,
    name,
    description,
    file
  ]);

  const startTimestampUint = Math.floor(
    new Date(startTimestamp).getTime() / 1000
  );
  const endTimestampUint = Math.floor(new Date(endTimestamp).getTime() / 1000);
  const unvestingStreamStartUint = Math.floor(
    new Date(unvestingStreamStart).getTime() / 1000
  );
  const unvestingStreamEndUint = Math.floor(
    new Date(unvestingStreamEnd).getTime() / 1000
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTx("");
    await checkAllowance();
    ref.current?.showModal();
    if (allowance >= totalSupplyRequired) {
      setStep(2);
    } else {
      setStep(1);
    }
  };

  const handleUpload = async () => {
    if (!file || !description || !name) {
      console.log("Missing input");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        console.error(result);
        return;
      }
      const formDataMeta = new FormData();
      formDataMeta.append("name", name);
      formDataMeta.append("description", description);
      formDataMeta.append("image", result.uri);
      const response_meta = await fetch("/api/upload/metadata", {
        method: "POST",
        body: formDataMeta,
      });
      const result_meta = await response_meta.json();
      if (!response_meta.ok) {
        console.error(result);
        return;
      }
      return result_meta.uri as string;
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const approveToken = async () => {
    if (!address || !isHex(tokenAddress)) return;
    try {
      isLoading(true);
      const tx = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          hippodromeAddress,
          parseUnits(totalSupplyRequired.toString(), 18),
        ],
      });
      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash: tx,
      });
      console.log(transactionReceipt);
      if (transactionReceipt.status === "success") {
        setStep(2);
      }
    } finally {
      isLoading(false);
    }
  };

  const checkAllowance = async () => {
    if (!address || !isHex(tokenAddress)) return;
    const result = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress,
      functionName: "allowance",
      args: [address, hippodromeAddress],
    });
    setAllowance(parseInt(formatUnits(result, 18)));
  };

  const createCampaign = async () => {
    try {
      isLoading(true);
      const uriCampaign = await handleUpload();
      if(!uriCampaign) {
        return;
      }
      const campaignParams = {
        poolSupply: parseUnits(poolSupply.toString(), 18),
        startTimestamp: BigInt(startTimestampUint),
        endTimestamp: BigInt(endTimestampUint),
        unvestingStreamStart: BigInt(unvestingStreamStartUint),
        unvestingStreamEnd: BigInt(unvestingStreamEndUint),
        rewardSupply: parseUnits(rewardSupply.toString(), 18),
        tokenAddress: tokenAddress as `0x${string}`,
        campaignURI: uriCampaign,
      };
      const tx = await writeContractAsync({
        address: hippodromeAddress,
        abi: hippodromeAbi,
        functionName: "createCampaign",
        args: [campaignParams],
      });
      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash: tx,
      });
      if (transactionReceipt.status === "success") {
        setStep(3);
        setTx(transactionReceipt.transactionHash);
        setPoolSupply("");
        setStartTimestamp("");
        setEndTimestamp("");
        setUnvestingStreamStart("");
        setUnvestingStreamEnd("");
        setRewardSupply("");
        setTokenAddress("");
        setName("");
        setDescription("")
        setFile(null)
      }
    } catch (e) {
      if (e instanceof ContractFunctionExecutionError) {
        console.log(e.shortMessage);
        toast.error(e.shortMessage);
        ref.current?.close();
      }
    } finally {
      isLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mt-8">
        Metadata
      </h2>
      <form className="p-6 bg-base-200 rounded-lg shadow-lg space-y-4 mt-2">
        <div className="grid grid-cols-1 gap-4">
          <div className="form-control flex-row space-x-3 items-center">
            {file ? (
              <Image
                alt="image"
                src={URL.createObjectURL(file)}
                height={128}
                width={128}
              />
            ) : (
              <span className="bg-base-300 flex flex-col items-center justify-center w-32 h-32 rounded-xl">
                128x128
              </span>
            )}
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="file-input"
              accept="image/jpeg, image/png, image/gif, image/jpg"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full h-28"
            />
          </div>
        </div>
      </form>
      <h2 className="font-bold mt-8 text-xl">Settings</h2>
      <form className="p-6 bg-base-200 rounded-lg shadow-lg space-y-4 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control col-span-2">
            <label className="label">
              <span className="label-text">Token Address</span>
            </label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Pool Supply</span>
            </label>
            <input
              type="number"
              value={poolSupply}
              onChange={(e) => setPoolSupply(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Reward Supply</span>
            </label>
            <input
              type="number"
              value={rewardSupply}
              onChange={(e) => setRewardSupply(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Start Timestamp</span>
            </label>
            <input
              type="datetime-local"
              value={startTimestamp}
              onChange={(e) => setStartTimestamp(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">End Timestamp</span>
            </label>
            <input
              type="datetime-local"
              value={endTimestamp}
              onChange={(e) => setEndTimestamp(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Unvesting Stream Start</span>
            </label>
            <input
              type="datetime-local"
              value={unvestingStreamStart}
              onChange={(e) => setUnvestingStreamStart(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Unvesting Stream End</span>
            </label>
            <input
              type="datetime-local"
              value={unvestingStreamEnd}
              onChange={(e) => setUnvestingStreamEnd(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>
        <div className="form-control">
          <button
            type="button"
            className="btn btn-primary mx-auto"
            disabled={!isFormValid}
            onClick={handleSubmit}
          >
            Start Campaign
          </button>
        </div>
      </form>
      <dialog className="modal" ref={ref}>
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          {step === 1 && (
            <div className="flex flex-col">
              <h1 className="font-bold text-lg">Approve token</h1>
              <p className="mt-4">
                The token allowance is insufficient. Please approve the required
                amount.
              </p>
              <button
                onClick={approveToken}
                className="btn btn-primary w-full mt-4 disabled:bg-primary disabled:text-primary-content"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-dots loading-md"></span>
                ) : (
                  <>Approve</>
                )}
              </button>
            </div>
          )}
          {step == 2 && (
            <div className="flex flex-col">
              <h1 className="font-bold text-lg">Recap campaign</h1>
              <div className="mt-4">
                <p>
                  <strong>Pool Supply:</strong> {poolSupply}
                </p>
                <p>
                  <strong>Start Timestamp:</strong> {startTimestamp}
                </p>
                <p>
                  <strong>End Timestamp:</strong> {endTimestamp}
                </p>
                <p>
                  <strong>Unvesting Stream Start:</strong>{" "}
                  {unvestingStreamStart}
                </p>
                <p>
                  <strong>Unvesting Stream End:</strong> {unvestingStreamEnd}
                </p>
                <p>
                  <strong>Reward Supply:</strong> {rewardSupply}
                </p>
                <p>
                  <strong>Token Address:</strong> {tokenAddress}
                </p>
              </div>
              <button
                onClick={createCampaign}
                className="btn btn-primary mt-4 w-full disabled:bg-primary disabled:text-primary-content"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-dots loading-md"></span>
                ) : (
                  <>Create</>
                )}
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col">
              <p className="font-semibold text-lg">
                Congratulations, you have create the campaign succesfully!
              </p>
              <p>
                Tx:{" "}
                <a href="#" className="link-hover" target="_blank">
                  {tx.slice(0, 5) + "..." + tx.slice(-5)}
                </a>
              </p>
            </div>
          )}
          <div
            className={twMerge(
              "flex justify-center mt-8",
              step > 2 && "hidden"
            )}
          >
            <ul className="steps">
              <li
                className={twMerge("step text-sm", step >= 1 && "step-success")}
              >
                Approve
              </li>
              <li
                className={twMerge("step text-sm", step == 2 && "step-success")}
              >
                Create
              </li>
            </ul>
          </div>
        </div>
      </dialog>
    </div>
  );
}
