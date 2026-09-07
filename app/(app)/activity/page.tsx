import { requireUser } from "@/lib/session";
import { getActivity } from "@/lib/services/activity-service";
import { ActivityFeed } from "@/components/activity-feed";

export default async function ActivityPage() {
  const user = await requireUser();
  const items = await getActivity(user.id, 50);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl">Activity</h1>
      <ActivityFeed items={items} />
    </div>
  );
}
