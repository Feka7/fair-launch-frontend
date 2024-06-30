"use client";
import AddFundsModal from "@/components/AddFundsModal";
import ClaimRewardsButton from "@/components/ClaimRewardsButton";
import ResolveCampaignButton from "@/components/ResolveCampaignButton";
import Symbol from "@/components/Symbol";
import WithdrawFundsModal from "@/components/WithdrawFundsModal";
import { hippodromeAbi, hippodromeAddress } from "@/lib/hippodrome";
import Image from "next/image";
import { notFound, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import useSWR from "swr";
import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Page() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen skeleton mt-4"></div>}
    >
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
        <CampaignInfo id={parseId} />
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
      <div className="flex w-full items-center">
        <div className="flex-grow">
          <CampaignName uri={data[11]} />
        </div>
        <div>
          <ResolveCampaignButton id={id} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 bg-base-200 rounded-lg justify-items-center items-center mt-4 p-4">
        <CampaignMetadata uri={data[11]} />
        <div>
          <p>Token: {data[2].slice(0, 5) + "..." + data[2].slice(-5)}</p>
          <p>Founder: {data[0].slice(0, 5) + "..." + data[0].slice(-5)}</p>
          <p>Pool: {data[4].slice(0, 5) + "..." + data[4].slice(-5)}</p>
        </div>
      </div>
    </>
  );
}

function CampaignName({ uri }: { uri: string }) {
  const { data, error } = useSWR(
    `/api/metadata?uri=${encodeURIComponent(uri)}`,
    fetcher
  );

  if (!data || error) {
    return <div className="skeleton w-20 h-10 rounded-xl"></div>;
  }

  const { name } = data;
  return <h1 className="text-3xl font-bold">{name}</h1>;
}

function CampaignMetadata({ uri }: { uri: string }) {
  const { data, error } = useSWR(
    `/api/metadata?uri=${encodeURIComponent(uri)}`,
    fetcher
  );

  if (!data || error) {
    return (
      <div className="flex flex-col w-full h-full rounded-xl skeleton col-span-2"></div>
    );
  }

  const { description, image } = data;

  return (
    <>
      <div>
        <CampaignImage uri={image} />
      </div>
      <div className="text-sm">{description}</div>
    </>
  );
}

function CampaignImage({ uri }: { uri: string }) {
  const { data, error } = useSWR(
    `/api/image?uri=${encodeURIComponent(uri)}`,
    fetcher
  );

  if (!data || error) {
    return <div className="skeleton w-32 h-32"></div>;
  }
  const { url } = data;
  return <Image src={url} width={128} height={128} alt="campaign image" />;
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
