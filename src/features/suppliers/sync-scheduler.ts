import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { syncJobs } from '@/db/schema';
import { syncInventory, syncPrices } from './importer';

/**
 * Schedule a sync job for a supplier.
 *
 * - Rejects if a running job already exists for the same supplier + jobType (concurrent prevention)
 * - Creates a new sync job record with status 'pending'
 * - Returns the job ID
 */
export async function scheduleSyncJob(
  supplierId: string,
  jobType: 'inventory' | 'price'
): Promise<string> {
  // Check for an existing running job for this supplier + jobType
  const [runningJob] = await db
    .select({ id: syncJobs.id })
    .from(syncJobs)
    .where(
      and(
        eq(syncJobs.supplierId, supplierId),
        eq(syncJobs.jobType, jobType),
        eq(syncJobs.status, 'running')
      )
    )
    .limit(1);

  if (runningJob) {
    throw new Error(
      `A ${jobType} sync job is already running for supplier ${supplierId}`
    );
  }

  const [job] = await db
    .insert(syncJobs)
    .values({
      supplierId,
      jobType,
      status: 'pending',
    })
    .returning({ id: syncJobs.id });

  return job.id;
}

/**
 * Run all pending sync jobs.
 *
 * For each pending job:
 * - Sets status to 'running' and records startedAt
 * - Calls the appropriate importer function (syncInventory or syncPrices)
 * - On success: sets status to 'completed' with result metrics and completedAt
 * - On failure: calls retrySyncJob to handle retry logic
 */
export async function runPendingSyncJobs(): Promise<void> {
  const pendingJobs = await db
    .select()
    .from(syncJobs)
    .where(eq(syncJobs.status, 'pending'));

  for (const job of pendingJobs) {
    // Mark as running
    await db
      .update(syncJobs)
      .set({
        status: 'running',
        startedAt: new Date(),
      })
      .where(eq(syncJobs.id, job.id));

    try {
      const result =
        job.jobType === 'inventory'
          ? await syncInventory(job.supplierId)
          : await syncPrices(job.supplierId);

      // Mark as completed with result metrics
      await db
        .update(syncJobs)
        .set({
          status: 'completed',
          productsChecked: result.checked,
          productsUpdated: result.updated,
          errorCount: result.errors,
          completedAt: new Date(),
          resultSummary: `Checked ${result.checked}, updated ${result.updated}, errors ${result.errors}`,
        })
        .where(eq(syncJobs.id, job.id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error';
      console.error(
        `Sync job ${job.id} failed for supplier ${job.supplierId}:`,
        errorMessage
      );
      await retrySyncJob(job.id);
    }
  }
}

/**
 * Handle retry logic for a failed sync job.
 *
 * - If retryCount >= 3, marks the job as 'failed' with completedAt
 * - Otherwise, increments retryCount and sets status back to 'pending'
 *   for the scheduler to pick up on the next run
 *
 * Exponential backoff delays (1min, 4min, 16min) are conceptual —
 * since we don't use real timers, we simply increment retryCount
 * and reset status to 'pending'.
 */
export async function retrySyncJob(jobId: string): Promise<void> {
  const [job] = await db
    .select()
    .from(syncJobs)
    .where(eq(syncJobs.id, jobId))
    .limit(1);

  if (!job) {
    throw new Error(`Sync job not found: ${jobId}`);
  }

  if (job.retryCount >= 3) {
    // Max retries reached — mark as failed
    await db
      .update(syncJobs)
      .set({
        status: 'failed',
        completedAt: new Date(),
        resultSummary: `Failed after ${job.retryCount} retries`,
      })
      .where(eq(syncJobs.id, jobId));
  } else {
    // Increment retry count and set back to pending
    await db
      .update(syncJobs)
      .set({
        status: 'pending',
        retryCount: job.retryCount + 1,
      })
      .where(eq(syncJobs.id, jobId));
  }
}
