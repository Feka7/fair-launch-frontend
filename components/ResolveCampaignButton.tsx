"use client";
import { hippodromeAbi, hippodromeAddress } from "@/lib/hippodrome";
import toast from "react-hot-toast";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { config } from "./Web3Provider";
import Countdown from "react-countdown";
import { ContractFunctionExecutionError } from "viem";

type Props = {
  id: number;
};

export default function ResolveCampaignButton({ id }: Props) {
  const { isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

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

  const campaign = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "getCampaign",
    args: [BigInt(id)],
  });

  if (isPendingResolved || campaign.isPending || !campaign.data) {
    return <div className="w-20 h-10 rounded-xl skeleton"></div>;
  }

  const canTerminate =
    Number(campaign.data[7]) * 1000 < new Date().getTime() ? true : false;

  if (canTerminate) {
    if (isResolved) {
      return <button className="btn btn-sm btn-disabled">Terminated</button>;
    } else {
      return (
        <button
          className="btn btn-primary btn-sm disabled:bg-primary disabled:text-primary-content"
          onClick={async () => {
            try {
              const tx = await writeContractAsync({
                abi: hippodromeAbi,
                address: hippodromeAddress,
                functionName: "resolveCampaign",
                args: [BigInt(id)],
              });
              const transactionReceipt = await waitForTransactionReceipt(
                config,
                {
                  hash: tx,
                }
              );
              refetch();
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
            } catch (e) {
              if (e instanceof ContractFunctionExecutionError) {
                console.error(e.message);
                toast.error(e.shortMessage);
              }
            }
          }}
          disabled={
            isPending || !isConnected || isPendingResolved || isResolved
          }
        >
          {isPending ? (
            <span className="loading loading-dots loading-md"></span>
          ) : (
            <>Resolve campaign</>
          )}
        </button>
      );
    }
  }

  const renderer = ({
    hours,
    minutes,
    seconds,
  }: {
    hours: any;
    minutes: any;
    seconds: any;
  }) => {
    console.log(hours);
    console.log(minutes);
    console.log(seconds);
    return (
      <span className="countdown font-mono text-2xl">
        <span style={{ "--value": hours } as React.CSSProperties}></span>h
        <span style={{ "--value": minutes } as React.CSSProperties}></span>m
        <span style={{ "--value": seconds } as React.CSSProperties}></span>s
      </span>
    );
  };
  return (
    <div className="flex">
      <span>Campaing ends in: </span>
      <Countdown
        date={new Date(Number(campaign.data[7]) * 1000)}
        renderer={renderer}
      />
    </div>
  );
}
