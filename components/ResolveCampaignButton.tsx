"use"
import {
  hippodromeAbi,
    hippodromeAddress
  } from "@/lib/hippodrome";
  import { useAccount, useWatchContractEvent, useWriteContract, useReadContract } from "wagmi";
  
  type Props = {
    id: number;
  };
  
  export default function ClaimRewardsButton({ id }: Props) {
    const { isConnected } = useAccount();
    const { writeContractAsync, isPending, data } = useWriteContract();
    useWatchContractEvent({
      address: hippodromeAddress,
      abi: hippodromeAbi,
      eventName: "CampaignTerminated",
      onLogs(logs) {
        console.log("New logs!", logs);
      },
    });
    //TO DO: read if the campaign is already ended
    // const result = useReadContract({
    //   abi,
    //   address: hippodromeAddress,
    //   functionName: 'totalSupply',
    // })
  
    return (
      <button
        className="btn btn-primary disabled:bg-primary disabled:text-primary-content"
        onClick={async () =>
          await writeContractAsync({
            abi: hippodromeAbi,
            address: hippodromeAddress,
            functionName: "resolveCampaign",
            args: [BigInt(id)],
          })
        }
        disabled={isPending || !isConnected}
      >
        {isPending ? (
          <span className="loading loading-dots loading-md"></span>
        ) : (
          <>Resolve campaign</>
        )}
      </button>
    );
  }
  