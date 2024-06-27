"use client";

import AddFundsModal from "@/components/AddFundsModal";
import NoAccount from "@/components/NoAccount";
import Symbol from "@/components/Symbol";
import WithdrawFundsModal from "@/components/WithdrawFundsModal";
import { hippodromeAbi, hippodromeAddress } from "@/lib/hippodrome";
import { formatUnits, parseUnits } from "viem";
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
      <div>
        <h2 className="text-2xl font-bold">Campaigns</h2>
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
  if (isPending) return <div className="flex min-h-screen skeleton"></div>;
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>Token</th>
              <th>Supply</th>
              <th>Current Stake</th>
              <th>Raised</th>
              <th>Start date</th>
              <th>End date</th>
              <th>Rewards</th>
              <th>Start unvest</th>
              <th>End unvest</th>
              <th>Founder</th>
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
      <td>{data[6].toString()}</td>
      <td>{data[7].toString()}</td>
      <td className="text-right">
      {formatUnits(data[10], 18)}
        <Symbol id={id} />
      </td>
      <td>{data[8].toString()}</td>
      <td>{data[9].toString()}</td>
      <td>{data[0].slice(0, 5) + "..." + data[0].slice(-5)}</td>
      <td><AddFundsModal id={id} /></td>
      <td><WithdrawFundsModal id={id} /></td>
    </tr>
  );
}
