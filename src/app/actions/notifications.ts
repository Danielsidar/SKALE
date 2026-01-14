'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export type NotificationType = 
  | 'new_course' 
  | 'lesson_update' 
  | 'new_file' 
  | 'message' 
  | 'announcement'
  | 'course_published';

interface CreateNotificationParams {
  userId: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  content?: string;
  link?: string;
  actorId?: string;
  targetId?: string;
}

/**
 * Creates a single notification for a specific user.
 */
export async function createNotification(params: CreateNotificationParams) {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('notifications')
    .insert([{
      profile_id: params.userId,
      organization_id: params.organizationId,
      type: params.type,
      title: params.title,
      content: params.content,
      link: params.link,
      actor_id: params.actorId,
      target_id: params.targetId
    }]);

  if (error) {
    console.error('Error creating notification:', error);
    throw new Error(error.message);
  }
}

/**
 * Sends a notification to all students enrolled in a specific course,
 * and also to all admins/support in the organization.
 */
export async function notifyCourseStudents(params: {
  courseId: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  content?: string;
  link?: string;
  actorId?: string;
  targetId?: string;
}) {
  const supabase = createAdminClient();
  
  // 1. Get all students enrolled in this course
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('profile_id')
    .eq('course_id', params.courseId);

  // 2. Get all admins and support staff in the organization
  const { data: staff, error: staffError } = await supabase
    .from('profiles')
    .select('id')
    .eq('organization_id', params.organizationId)
    .in('role', ['admin', 'support']);

  if (enrollError || staffError) {
    console.error('Error fetching recipients for notification:', enrollError || staffError);
    return;
  }

  // Combine recipients and remove duplicates and the actor
  const recipientIds = new Set([
    ...(enrollments?.map(e => e.profile_id) || []),
    ...(staff?.map(s => s.id) || [])
  ]);
  
  // Remove the actor (the person who triggered the notification)
  if (params.actorId) {
    recipientIds.delete(params.actorId);
  }

  if (recipientIds.size === 0) return;

  const notifications = Array.from(recipientIds).map(profileId => ({
    profile_id: profileId,
    organization_id: params.organizationId,
    type: params.type,
    title: params.title,
    content: params.content,
    link: params.link,
    actor_id: params.actorId,
    target_id: params.targetId
  }));

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    console.error('Error creating bulk notifications:', error);
  }
}

/**
 * Sends a notification to ALL members (students and staff) in an organization.
 */
export async function notifyAllStudents(params: {
  organizationId: string;
  type: NotificationType;
  title: string;
  content?: string;
  link?: string;
  actorId?: string;
  targetId?: string;
}) {
  const supabase = createAdminClient();
  
  // Get all profiles in the organization
  const { data: members, error: memberError } = await supabase
    .from('profiles')
    .select('id')
    .eq('organization_id', params.organizationId);

  if (memberError) {
    console.error('Error fetching members for notification:', memberError);
    return;
  }

  if (!members || members.length === 0) return;

  // Filter out the actor
  const recipientIds = members
    .map(m => m.id)
    .filter(id => id !== params.actorId);

  if (recipientIds.length === 0) return;

  const notifications = recipientIds.map(profileId => ({
    profile_id: profileId,
    organization_id: params.organizationId,
    type: params.type,
    title: params.title,
    content: params.content,
    link: params.link,
    actor_id: params.actorId,
    target_id: params.targetId
  }));

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    console.error('Error creating bulk notifications:', error);
  }
}

export async function getNotifications(orgSlug: string) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single();

  if (!organization) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('organization_id', organization.id)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient(cookies());
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw new Error(error.message);
  }

  revalidatePath('/', 'layout');
}

export async function markAllNotificationsAsRead(orgId: string) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('organization_id', orgId)
    .eq('profile_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error(error.message);
  }

  revalidatePath('/', 'layout');
}

