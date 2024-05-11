import {Ratelimit} from '@upstash/ratelimit';
import {Redis} from '@upstash/redis';

export const ratelimit = new Ratelimit({
    redis : Redis.fromEnv(),
    limiter : Ratelimit.slidingWindow(10, "100 s"),
    analytics : true,
    timeout : 10000, // 10 sec
})

export const ratelimitForS3 = new Ratelimit({
    redis : Redis.fromEnv(),
    limiter : Ratelimit.slidingWindow(5, "3600 s"),
    analytics : true,
    timeout : 1000000, // 1000 sec
})