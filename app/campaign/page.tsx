"use client";
import { hippodromeAbi, hippodromeAddress } from "@/lib/hippodrome";
import { notFound, useSearchParams } from "next/navigation";
import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import Symbol from "@/components/Symbol";
import AddFundsModal from "@/components/AddFundsModal";
import WithdrawFundsModal from "@/components/WithdrawFundsModal";
import ClaimRewardsButton from "@/components/ClaimRewardsButton";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen skeleton mt-4"></div>}>
      <Campaign />
    </Suspense>
  );
}

function Campaign() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  if (!id) notFound();

  const parseId = parseInt(id);
  return (
    <>
      <div className="flex flex-col mt-8">
        <h1 className="text-3xl font-bold">Campaign XYZ</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 bg-base-200 rounded-lg justify-items-center items-center mt-4">
          <div>
            <div className="bg-base-300 rounded-xl flex flex-col items-center justify-center w-full p-8">
              <p>Image</p>
            </div>
          </div>
          <div>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy
            text ever since the 1500s, when an unknown printer took a galley of
            type and scrambled it to make a type specimen book.
          </div>
          <div>
            <CampaignInfo id={parseId} />
          </div>
        </div>
        <h2 className="text-xl font-bold mt-4">Stats</h2>
        <div className="bg-base-200 rounded-xl p-4">
          <CampaignStake id={parseId} />
          <div className="flex flex-row mt-6">
            <div className="text-lg font-bold grow">Your position</div>
            <div className="flex space-x-3">
              <AddFundsModal id={parseId} />
              <WithdrawFundsModal id={parseId} />
            </div>
          </div>
          <CampaignStakeAccount id={parseId} />
        </div>
        <h2 className="text-xl font-bold mt-4">Rewards</h2>
        <div className="bg-base-200 rounded-xl p-4">
          <CampaignRewardsSupply id={parseId} />
          <div className="flex flex-row mt-6">
            <div className="text-lg font-bold grow">Your rewards</div>
            <div className="flex space-x-3">
              <ClaimRewardsButton id={parseId} />
            </div>
          </div>
          <CampaignRewardsAccount id={parseId} />
        </div>
      </div>
    </>
  );
}

function CampaignInfo({ id }: { id: number }) {
  const { isPending, data, isError } = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "getCampaign",
    args: [BigInt(id)],
  });
  if (isPending || isError) {
    return <div className="skeleton w-32 h-32"></div>;
  }
  return (
    <>
      <p>Token: {data[2].slice(0, 5) + "..." + data[2].slice(-5)}</p>
      <p>Founder: {data[0].slice(0, 5) + "..." + data[0].slice(-5)}</p>
      <p>Pool: {data[4].slice(0, 5) + "..." + data[4].slice(-5)}</p>
    </>
  );
}

function CampaignStake({ id }: { id: number }) {
  const { isPending, data, isError } = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "getCampaign",
    args: [BigInt(id)],
  });
  if (isPending || isError) {
    return <div className="skeleton w-32 h-32"></div>;
  }
  return (
    <div className="stats shadow w-full mt-2">
      <div className="stat">
        <div className="stat-title">Total supply</div>
        <div className="stat-value text-primary">
          {formatUnits(data[1], 18)} <Symbol id={id} />
        </div>
      </div>
      <div className="stat">
        <div className="stat-title">Current stake</div>
        <div className="stat-value text-primary">
          {formatUnits(data[3], 6)} $
        </div>
      </div>
      <div className="stat">
        <div className="stat-title">Raised</div>
        <div className="stat-value text-primary">
          {formatUnits(data[5], 18)} $
        </div>
      </div>
    </div>
  );
}

function CampaignRewardsSupply({ id }: { id: number }) {
  const { isPending, data, isError } = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "getCampaign",
    args: [BigInt(id)],
  });
  if (isPending || isError) {
    return <div className="skeleton w-32 h-32"></div>;
  }
  return (
    <div className="stats shadow max-w-lg w-full mt-2">
      <div className="stat">
        <div className="stat-title">Rewards supply</div>
        <div className="stat-value text-primary">
          {formatUnits(data[10], 18)}
          <Symbol id={id} />
        </div>
      </div>
    </div>
  );
}

function CampaignStakeAccount({ id }: { id: number }) {
  const { address } = useAccount();
  const accountStake = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "getUserStake",
    args: [address!, BigInt(id)],
  });
  const accountPercentuage = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "calculateContributionPercentage",
    args: [BigInt(id), address!],
  });
  return (
    <div className="stats shadow w-full mt-2">
      <div className="stat">
        <div className="stat-title">Contribution</div>
        <div className="stat-value text-primary">
          {accountPercentuage.data && (
            <>{accountPercentuage.data.toString()} %</>
          )}
        </div>
      </div>
      <div className="stat">
        <div className="stat-title">Stake</div>
        <div className="stat-value text-primary">
          {accountStake.data && <>{formatUnits(accountStake.data, 6)} $</>}
        </div>
      </div>
    </div>
  );
}

function CampaignRewardsAccount({ id }: { id: number }) {
  const { address } = useAccount();
  const accountRewards = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "getUserRewardStatus",
    args: [BigInt(id), address!],
  });
  const accountAvailableRewards = useReadContract({
    abi: hippodromeAbi,
    address: hippodromeAddress,
    functionName: "getAvailableUserRewards",
    args: [address!, BigInt(id)],
  });

  return (
    <div className="stats shadow w-full mt-2">
      <div className="stat">
        <div className="stat-title">Total</div>
        <div className="stat-value text-primary">
          {accountRewards.data ? formatUnits(accountRewards.data[0], 18) : "0"}
          <Symbol id={id} />
        </div>
      </div>
      <div className="stat">
        <div className="stat-title">Available</div>
        <div className="stat-value text-primary">
          {accountAvailableRewards.data
            ? formatUnits(accountAvailableRewards.data, 18)
            : "0"}{" "}
          <Symbol id={id} />
        </div>
      </div>
      <div className="stat">
        <div className="stat-title">Claimed</div>
        <div className="stat-value text-primary">
          {accountRewards.data ? formatUnits(accountRewards.data[1], 18) : "0"}{" "}
          <Symbol id={id} />
        </div>
      </div>
    </div>
  );
}
