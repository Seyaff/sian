import { campaignService } from "../services/marketing/campaign.service";
import { conversationArchiveService } from "../services/memory/conversation-archive.service";

const ARCHIVE_INTERVAL_MS = 15 * 60 * 1000;
const CAMPAIGN_CHECK_INTERVAL_MS = 5 * 60 * 1000;

export function startBackgroundJobs(): void {
  setInterval(async () => {
    try {
      const archived = await conversationArchiveService.archiveIdleSessions(30);
      if (archived > 0) {
        console.log(`[JOBS] Archived ${archived} idle conversation(s)`);
      }
    } catch (error) {
      console.error("[JOBS] Archive error:", error);
    }
  }, ARCHIVE_INTERVAL_MS);

  setInterval(async () => {
    try {
      const sent = await campaignService.processScheduled();
      if (sent > 0) {
        console.log(`[JOBS] Processed ${sent} scheduled campaign(s)`);
      }
    } catch (error) {
      console.error("[JOBS] Campaign scheduler error:", error);
    }
  }, CAMPAIGN_CHECK_INTERVAL_MS);

  console.log("[JOBS] Background jobs started (archive + campaigns)");
}
