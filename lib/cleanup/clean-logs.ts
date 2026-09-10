import { db } from "@/src/db";
import { 
  notifications, 
  emailMessages, 
  emailProviderChecks,
  smsMessages,
  smsProviderChecks
} from "@/src/db/schema";
import { sql } from "drizzle-orm";
import { logInfo, logError } from "@/lib/log";

/**
 * Clean up expired log records older than 30 days.
 * Cleans: notifications, email_messages, email_provider_checks, 
 *         sms_messages, sms_provider_checks
 */
export async function cleanExpiredLogs(): Promise<{
  notifications: number;
  emailMessages: number;
  emailProviderChecks: number;
  smsMessages: number;
  smsProviderChecks: number;
}> {
  try {
    const cutoffDate = sql`CURRENT_TIMESTAMP - INTERVAL '30 days'`;
    
    // Clean notifications
    const notificationsResult = await db
      .delete(notifications)
      .where(sql`${notifications.createdAt} < ${cutoffDate}`)
      .returning({ id: notifications.id });
    
    // Clean email_messages
    const emailMessagesResult = await db
      .delete(emailMessages)
      .where(sql`${emailMessages.createdAt} < ${cutoffDate}`)
      .returning({ id: emailMessages.id });
    
    // Clean email_provider_checks
    const emailProviderChecksResult = await db
      .delete(emailProviderChecks)
      .where(sql`${emailProviderChecks.createdAt} < ${cutoffDate}`)
      .returning({ id: emailProviderChecks.id });
    
    // Clean sms_messages
    const smsMessagesResult = await db
      .delete(smsMessages)
      .where(sql`${smsMessages.createdAt} < ${cutoffDate}`)
      .returning({ id: smsMessages.id });
    
    // Clean sms_provider_checks
    const smsProviderChecksResult = await db
      .delete(smsProviderChecks)
      .where(sql`${smsProviderChecks.createdAt} < ${cutoffDate}`)
      .returning({ id: smsProviderChecks.id });
    
    const result = {
      notifications: notificationsResult.length,
      emailMessages: emailMessagesResult.length,
      emailProviderChecks: emailProviderChecksResult.length,
      smsMessages: smsMessagesResult.length,
      smsProviderChecks: smsProviderChecksResult.length,
    };
    
    const totalDeleted = Object.values(result).reduce((sum, count) => sum + count, 0);
    
    if (totalDeleted > 0) {
      logInfo("cleanup.logs.cleaned", {
        ...result,
        total: totalDeleted,
        timestamp: new Date().toISOString(),
      });
    }
    
    return result;
  } catch (error) {
    logError("cleanup.logs.failed", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}