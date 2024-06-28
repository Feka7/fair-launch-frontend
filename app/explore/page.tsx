"use client";

import NoAccount from "@/components/NoAccount";
import Symbol from "@/components/Symbol";
import { hippodromeAbi, hippodromeAddress } from "@/lib/hippodrome";
import Link from "next/link";
import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";

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
      <div className="mt-8">
        <h2 className="text-3xl font-bold">Campaigns</h2>
        <Explore />
      </div>
    </>
  );
}

function Explore() {
  const { isPending, data } = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "_campaignCounter",
  });
  if (isPending) return <div className="flex min-h-screen skeleton mt-4"></div>;
  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>Token</th>
              <th>Supply</th>
              <th>Current Stake</th>
              <th>Raised</th>
              <th>Rewards</th>
              <th>End date</th>
              <th>Start unvest</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data && (
              <>
                {Array.from({ length: Number(data) }, (_, index) => (
                  <Campaign id={index + 1} key={index} />
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Campaign({ id }: { id: number }) {
  const { isPending, data, isError } = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "getCampaign",
    args: [BigInt(id)],
  });
  if (isPending) {
    return <tr className="skeleton w-20 h-10"></tr>;
  }
  if (isError) {
    return <tr className="">Error: impossible retrieve the data</tr>;
  }

  return (
    <tr>
      <th>{data[2].slice(0, 5) + "..." + data[2].slice(-5)}</th>
      <td className="text-right">
        {formatUnits(data[1], 18)}
        <Symbol id={id} />
      </td>
      <td className="text-right">{formatUnits(data[3], 6)} $</td>
      <td className="text-right">{formatUnits(data[5], 18)}$</td>
      <td className="text-right">
      {formatUnits(data[10], 18)}
        <Symbol id={id} />
      </td>
      <td>{new Date(Number(data[7]) * 1000).toISOString().replace("T", " ").slice(0, -5)}</td>
      <td>{new Date(Number(data[8]) * 1000).toISOString().replace("T", " ").slice(0, -5)}</td>
      <td><Link className="btn btn-xs btn-primary" href={"/campaign?id="+id}>View</Link></td>
    </tr>
  );
}
