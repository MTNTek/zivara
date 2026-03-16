import { NextResponse } from 'next/server';
import { db } from '@/db';
import { syncJobs, suppliers } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const jobs = await db
      .select({
        id: syncJobs.id,
        supplierId: syncJobs.supplierId,
        supplierName: suppliers.name,
        jobType: syncJobs.jobType,
        status: syncJobs.status,
        productsChecked: syncJobs.productsChecked,
        productsUpdated: syncJobs.productsUpdated,
        errorCount: syncJobs.errorCount,
        resultSummary: syncJobs.resultSummary,
        retryCount: syncJobs.retryCount,
        startedAt: syncJobs.startedAt,
        completedAt: syncJobs.completedAt,
        createdAt: syncJobs.createdAt,
      })
      .from(syncJobs)
      .innerJoin(suppliers, eq(syncJobs.supplierId, suppliers.id))
      .orderBy(desc(syncJobs.createdAt))
      .limit(100);

    return NextResponse.json(jobs);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
