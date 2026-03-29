import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Get current active meeting link
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get all active meetings with their appointments and leads
    const { data: meetings, error } = await supabase
      .from('active_meetings')
      .select(`
        *,
        appointment:appointments(
          *,
          lead:leads(*)
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch meetings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ meetings: meetings || [] });

  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create or update meeting link (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, lead_id, meeting_link } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!lead_id || !meeting_link) {
      return NextResponse.json(
        { error: 'Missing lead_id or meeting_link' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if appointment exists for this lead
    let { data: appointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('lead_id', lead_id)
      .single();

    // Create appointment if it doesn't exist
    if (!appointment) {
      const { data: newAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          lead_id,
          scheduled_at: new Date().toISOString(),
          meeting_link,
          status: 'scheduled'
        })
        .select()
        .single();

      if (appointmentError) {
        return NextResponse.json(
          { error: 'Failed to create appointment' },
          { status: 500 }
        );
      }
      appointment = newAppointment;
    } else {
      // Update existing appointment
      await supabase
        .from('appointments')
        .update({ meeting_link })
        .eq('id', appointment.id);
    }

    // Deactivate any existing active meetings for this appointment
    await supabase
      .from('active_meetings')
      .update({ is_active: false })
      .eq('appointment_id', appointment.id);

    // Create new active meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('active_meetings')
      .insert({
        appointment_id: appointment.id,
        meeting_link,
        is_active: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      .select()
      .single();

    if (meetingError) {
      return NextResponse.json(
        { error: 'Failed to create meeting' },
        { status: 500 }
      );
    }

    // Update lead status
    await supabase
      .from('leads')
      .update({ status: 'scheduled' })
      .eq('id', lead_id);

    return NextResponse.json({
      success: true,
      meeting
    });

  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Deactivate meeting (admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');
    const meetingId = searchParams.get('meeting_id');

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();

    if (meetingId) {
      // Deactivate specific meeting
      await supabase
        .from('active_meetings')
        .update({ is_active: false })
        .eq('id', meetingId);
    } else {
      // Deactivate all meetings
      await supabase
        .from('active_meetings')
        .update({ is_active: false })
        .eq('is_active', true);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deactivating meeting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
