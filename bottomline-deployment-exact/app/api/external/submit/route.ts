// ============================================================
//  Connector stub for the external systems (Alteryx / ROC).
//  The browser genuinely polls a backend for completion instead
//  of running a timer — the same shape a real vendor API
//  integration would have.
//
//  Job state is encoded entirely in the jobId (stageId + start
//  time) rather than kept in an in-memory Map. Serverless hosts
//  (Vercel) route each request to whichever instance is warm, so
//  a Map-backed job store can "forget" a job the moment the poll
//  lands on a different instance — the client then sees a 404,
//  treats the connector as unreachable, and fails the step even
//  though nothing actually went wrong. Encoding state in the id
//  makes every request self-contained, so status lookups always
//  succeed no matter which instance handles them.
//
//  POST /api/external/submit   { stageId }  -> { jobId, ... }
//  GET  /api/external/submit?jobId=...      -> job status
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { EXTERNAL_CONNECTORS, ExternalJobStatus } from '@/lib/externalConnectors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JOB_ID_SEP = '::';

function encodeJobId(stageId: string, startedAt: number) {
  return [stageId, startedAt, randomUUID()].join(JOB_ID_SEP);
}

function decodeJobId(jobId: string): { stageId: string; startedAt: number } | null {
  const [stageId, startedAtRaw] = jobId.split(JOB_ID_SEP);
  const startedAt = Number(startedAtRaw);
  if (!stageId || !EXTERNAL_CONNECTORS[stageId] || !Number.isFinite(startedAt)) return null;
  return { stageId, startedAt };
}

function statusOf(jobId: string, stageId: string, startedAt: number): ExternalJobStatus {
  const connector = EXTERNAL_CONNECTORS[stageId];
  const elapsed = Date.now() - startedAt;
  const total = connector.phases.reduce((sum, p) => sum + p.ms, 0);

  let acc = 0;
  let phaseIndex = connector.phases.length - 1;
  for (let i = 0; i < connector.phases.length; i++) {
    acc += connector.phases[i].ms;
    if (elapsed < acc) {
      phaseIndex = i;
      break;
    }
  }
  const done = elapsed >= total;

  return {
    jobId,
    stageId,
    system: connector.system,
    phaseIndex: done ? connector.phases.length : phaseIndex,
    phaseLabel: done ? 'Returned' : connector.phases[phaseIndex].label,
    totalPhases: connector.phases.length,
    progress: Math.min(1, elapsed / total),
    done,
    handoffOut: connector.handoffOut,
    nextAction: connector.nextAction,
  };
}

export async function POST(req: NextRequest) {
  const { stageId } = await req.json();
  if (!stageId || !EXTERNAL_CONNECTORS[stageId]) {
    return NextResponse.json({ error: 'Unknown external stage.' }, { status: 400 });
  }
  const startedAt = Date.now();
  const jobId = encodeJobId(stageId, startedAt);
  return NextResponse.json(statusOf(jobId, stageId, startedAt));
}

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');
  const decoded = jobId ? decodeJobId(jobId) : null;
  if (!jobId || !decoded) {
    return NextResponse.json({ error: 'Unknown job.' }, { status: 404 });
  }
  return NextResponse.json(statusOf(jobId, decoded.stageId, decoded.startedAt));
}
