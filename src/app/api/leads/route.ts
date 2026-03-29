import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, phone, existing_website, notes } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Insert lead into database
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        first_name,
        last_name,
        email,
        phone,
        existing_website: existing_website || null,
        notes: notes || null,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    // Send welcome email
    try {
      await resend.emails.send({
        from: 'Free Website Design <hello@freewebsitedesign.today>',
        to: email,
        subject: 'Welcome to Free Website Design Today!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome, ${first_name}!</h1>
              <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">Your free website design is on the way!</p>
            </div>

            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
              <h2 style="color: #1e293b; margin-top: 0;">We're Getting to Work Right Away!</h2>

              <p>Great news! Our design team has received your information and we're already starting to work on your new website.</p>

              <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #3b82f6; margin-top: 0;">What's Next?</h3>
                <ol style="margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 10px;">We're analyzing your current website and notes</li>
                  <li style="margin-bottom: 10px;">Our designers are creating your custom mockup</li>
                  <li style="margin-bottom: 10px;">Your design will be ready for your scheduled demo call</li>
                </ol>
              </div>

              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Make sure you've scheduled your demo call! If you haven't, go back to our website and click the calendar button.</p>
              </div>

              <p style="color: #64748b; font-size: 14px; margin-top: 30px; text-align: center;">
                Questions? Reply to this email or call us anytime.<br>
                We can't wait to show you your new website!
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} FreeWebsiteDesign.today. All rights reserved.</p>
            </div>
          </body>
          </html>
        `
      });

      // Log email sent
      await supabase
        .from('email_logs')
        .insert({
          lead_id: lead.id,
          email_type: 'welcome'
        });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      id: lead.id,
      message: 'Lead saved successfully'
    });

  } catch (error) {
    console.error('Error processing lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all leads (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();

    const { data: leads, error } = await supabase
      .from('leads')
      .select('*, appointments(*)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({ leads });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
