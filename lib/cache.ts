import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// TTL dalam detik
const TTL = {
  stats:       5 * 60,   // 5 menit
  members:     60 * 60,  // 1 jam
  milestones:  30 * 60,  // 30 menit
  userstories: 10 * 60,  // 10 menit (naikkan dari 5)
}

export async function getCached<T>(
  key: string,
  ttlKey: keyof typeof TTL,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    // Cek cache dulu
    const cached = await redis.get<T>(key)
    if (cached) {
      console.log(`[Cache HIT] ${key}`)
      return cached
    }

    // Kalau tidak ada, fetch dari Taiga
    console.log(`[Cache MISS] ${key} — fetching from Taiga...`)
    const fresh = await fetcher()

    // Simpan ke Redis dengan TTL
    await redis.set(key, fresh, { ex: TTL[ttlKey] })

    return fresh
  } catch (error) {
    // Kalau Redis error, tetap fetch dari Taiga (fallback)
    console.warn(`[Cache ERROR] ${key} — falling back to direct fetch`)
    return fetcher()
  }
}

export async function invalidateCache(key: string) {
  try {
    await redis.del(key)
    console.log(`[Cache] Deleted: ${key}`)
  } catch (error) {
    console.warn(`[Cache] Failed to delete: ${key}`, error)
  }
}