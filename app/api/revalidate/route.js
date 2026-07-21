import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': process.env.ADMIN_URL || 'https://admin.ngwindsongk.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-revalidate-secret',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

async function handleRevalidate(request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret') || request.headers.get('x-revalidate-secret');
    const expectedSecret = process.env.REVALIDATE_SECRET || 'super_secure_revalidation_secret_token_2026';

    if (secret !== expectedSecret) {
        return NextResponse.json(
            { message: 'Invalid revalidation secret token' },
            { status: 401, headers: CORS_HEADERS }
        );
    }

    try {
        revalidatePath('/', 'layout');
        return NextResponse.json(
            {
                revalidated: true,
                message: 'All Next.js cached pages successfully purged and revalidated.',
                now: Date.now(),
            },
            { headers: CORS_HEADERS }
        );
    } catch (err) {
        return NextResponse.json(
            { message: 'Error revalidating path', error: err.message },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}

export async function POST(request) {
    return handleRevalidate(request);
}

export async function GET(request) {
    return handleRevalidate(request);
}
