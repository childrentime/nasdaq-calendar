import { NextRequest } from "next/server";

export const runtime = 'edge';
export const dynamic = 'force-dynamic' // defaults to auto
export const preferredRegion = 'hkg1'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('date')
  const res = await fetch(`https://api.nasdaq.com/api/calendar/earnings?date=${query}`);
  const data = await res.json()
 
  return Response.json({ data })
}