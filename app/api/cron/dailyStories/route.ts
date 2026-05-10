/**
 * Compatibility route for old cron/manual triggers.
 *
 * The active story pipeline is /api/cron/dailyAutoPublisher, which queues work
 * in Supabase and is processed by /api/cron/storyQueueWorker.
 */
export { GET, POST } from '../dailyAutoPublisher/route';
