"use client";

import { hippodromeAbi, hippodromeAddress } from "@/lib/hippodrome";
import { useReadContract } from "wagmi";

export default function Symbol({ id }: { id: number }) {
    const { data } = useReadContract({
      abi: hippodromeAbi,
      address: hippodromeAddress,
      functionName: "getCampaignTokenInfos",
      args: [BigInt(id)],
    });
    return <span className="ml-1">{data?.[1]}</span>;
  }