const WINDOW_MS = 15 * 60 * 1000;

type RateLimitEntry = {
    count: number;
    expiresAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

const now = () => Date.now();

const cleanupExpiredEntries = () => {
    const current = now();

    for (const [key, value] of buckets.entries()) {
        if (value.expiresAt <= current) {
            buckets.delete(key);
        }
    }
};

export const getClientIp = (req: Request) => {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0]?.trim() || "unknown";
    }

    const realIp = req.headers.get("x-real-ip");
    if (realIp) {
        return realIp.trim();
    }

    return "unknown";
};

export const rateLimit = ({
    key,
    limit,
    windowMs = WINDOW_MS,
}: {
    key: string;
    limit: number;
    windowMs?: number;
}) => {
    cleanupExpiredEntries();

    const current = now();
    const entry = buckets.get(key);

    if (!entry || entry.expiresAt <= current) {
        buckets.set(key, { count: 1, expiresAt: current + windowMs });
        return {
            allowed: true,
            remaining: limit - 1,
            resetInMs: windowMs,
        };
    }

    if (entry.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            resetInMs: Math.max(0, entry.expiresAt - current),
        };
    }

    entry.count += 1;

    return {
        allowed: true,
        remaining: Math.max(0, limit - entry.count),
        resetInMs: Math.max(0, entry.expiresAt - current),
    };
};
