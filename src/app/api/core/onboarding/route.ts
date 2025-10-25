import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { jsonOk, jsonError } from '@/lib/api-utils';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const userId = authHeader?.replace('Bearer ', '');

    if (!userId) {
      return jsonError('Unauthorized', 401);
    }

    const progress = await db.get(
      sql`SELECT * FROM onboarding_progress WHERE user_id = ${userId}`
    );

    const checklist = await db.all(
      sql`SELECT * FROM checklist_items WHERE user_id = ${userId} ORDER BY id ASC`
    );

    return jsonOk({
      progress: progress || {
        current_step: 0,
        completed_steps: [],
        setup_complete: 0
      },
      checklist
    });
  } catch (error: any) {
    console.error('GET onboarding error:', error);
    return jsonError(error.message || 'Internal server error', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const userId = authHeader?.replace('Bearer ', '');

    if (!userId) {
      return jsonError('Unauthorized', 401);
    }

    const body = await request.json();
    const now = new Date().toISOString();

    const existing = await db.get(
      sql`SELECT id FROM onboarding_progress WHERE user_id = ${userId}`
    );

    if (existing) {
      await db.run(
        sql`UPDATE onboarding_progress SET
            current_step = ${body.current_step || 0},
            completed_steps = ${JSON.stringify(body.completed_steps || [])},
            personal_info_completed = ${body.personal_info_completed || 0},
            business_info_completed = ${body.business_info_completed || 0},
            branding_completed = ${body.branding_completed || 0},
            first_client_added = ${body.first_client_added || 0},
            first_invoice_created = ${body.first_invoice_created || 0},
            setup_complete = ${body.setup_complete || 0},
            updated_at = ${now}
          WHERE user_id = ${userId}`
      );
    } else {
      await db.run(
        sql`INSERT INTO onboarding_progress (
          user_id, current_step, completed_steps, personal_info_completed,
          business_info_completed, branding_completed, first_client_added,
          first_invoice_created, setup_complete, created_at, updated_at
        ) VALUES (
          ${userId}, ${body.current_step || 0}, ${JSON.stringify(body.completed_steps || [])},
          ${body.personal_info_completed || 0}, ${body.business_info_completed || 0},
          ${body.branding_completed || 0}, ${body.first_client_added || 0},
          ${body.first_invoice_created || 0}, ${body.setup_complete || 0}, ${now}, ${now}
        )`
      );
    }

    return jsonOk({ success: true });
  } catch (error: any) {
    console.error('PUT onboarding error:', error);
    return jsonError(error.message || 'Internal server error', 500);
  }
}