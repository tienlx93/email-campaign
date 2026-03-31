import type { Knex } from 'knex';

// Helper: random int between min and max inclusive
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: shuffle array in-place and return it
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const RICH_BODIES = [
  `<h2>Welcome to our platform!</h2>
<p>We're thrilled to have you on board. Here's what you can do <strong>right now</strong>:</p>
<ul>
  <li>Set up your <strong>profile</strong> and preferences</li>
  <li>Explore our <a href="https://example.com/features">feature tour</a></li>
  <li>Connect with your team</li>
</ul>
<p>If you have any questions, visit our <a href="https://example.com/help">Help Center</a>.</p>`,

  `<h2>Your Monthly Newsletter — March 2026</h2>
<p>Here are the <strong>top stories</strong> this month:</p>
<ol>
  <li><strong>New dashboard</strong> released with real-time analytics</li>
  <li>Performance improvements across all services</li>
  <li>Upcoming <a href="https://example.com/webinar">webinar on April 10th</a></li>
</ol>
<p>Stay tuned for more updates!</p>`,

  `<h2>Big Product Launch 🚀</h2>
<p>We're excited to announce the release of <strong>Campaign Manager 2.0</strong>.</p>
<p>Key highlights:</p>
<ul>
  <li><strong>Bulk scheduling</strong> — queue up to 100 campaigns at once</li>
  <li><strong>Open-rate analytics</strong> with per-recipient tracking</li>
  <li>Dark mode support</li>
</ul>
<p><a href="https://example.com/launch">Read the full announcement →</a></p>`,

  `<h2>Special Offer — This Week Only</h2>
<p>As a valued subscriber, you're getting <strong>exclusive early access</strong> to our new plan.</p>
<p>Use code <strong>SPRING26</strong> at checkout to unlock:</p>
<ul>
  <li>50% off your first 3 months</li>
  <li>Unlimited recipients</li>
  <li>Priority support</li>
</ul>
<p><a href="https://example.com/upgrade">Claim your discount →</a></p>`,

  `<h2>Re-engagement: We Miss You!</h2>
<p>It's been a while since we've heard from you. We wanted to reach out and share a few things that are <strong>new since your last visit</strong>:</p>
<ul>
  <li>Improved email composer with <strong>rich text editing</strong></li>
  <li>New recipient segment filters</li>
  <li><a href="https://example.com/changelog">Full changelog</a></li>
</ul>
<p>We'd love to have you back. <a href="https://example.com/login">Sign in now →</a></p>`,

  `<h2>Action Required: Confirm Your Email</h2>
<p>Please <strong>confirm your email address</strong> to keep your account active.</p>
<p>If you don't confirm within 7 days, your account may be suspended.</p>
<p><a href="https://example.com/confirm">Confirm my email →</a></p>
<p>If you didn't create an account, you can safely ignore this message.</p>`,

  `<h2>Weekly Digest — Week of 24 March</h2>
<p>Here's a summary of your <strong>campaign performance</strong> this week:</p>
<ul>
  <li>Emails sent: <strong>1,240</strong></li>
  <li>Open rate: <strong>34%</strong></li>
  <li>Click-through rate: <strong>12%</strong></li>
</ul>
<p>View detailed reports on your <a href="https://example.com/dashboard">dashboard</a>.</p>`,

  `<h2>Introducing: Recipient Segments</h2>
<p>You can now group your recipients into <strong>smart segments</strong> based on behaviour and attributes.</p>
<p>Benefits:</p>
<ul>
  <li>Send more <strong>targeted campaigns</strong></li>
  <li>Improve open rates by up to <strong>40%</strong></li>
  <li>Automate follow-ups based on engagement</li>
</ul>
<p><a href="https://example.com/segments">Learn more about segments →</a></p>`,
];

const CAMPAIGNS: { name: string; subject: string; daysOffset: number }[] = [
  { name: 'Spring Kickoff',        subject: 'Spring is here!',               daysOffset: -6  }, // 25 Mar
  { name: 'Product Teaser',        subject: 'Something big is coming…',      daysOffset: -6  },
  { name: 'March Newsletter',      subject: 'Your March digest',             daysOffset: -5  }, // 26 Mar
  { name: 'Re-engagement Blast',   subject: 'We miss you!',                  daysOffset: -5  },
  { name: 'Flash Sale',            subject: 'This week only — 50% off',      daysOffset: -4  }, // 27 Mar
  { name: 'Feature Spotlight',     subject: 'Have you tried segments?',      daysOffset: -4  },
  { name: 'Weekly Digest #12',     subject: 'Your week in review',           daysOffset: -3  }, // 28 Mar
  { name: 'Onboarding Wave 3',     subject: 'Welcome to the platform!',      daysOffset: -3  },
  { name: 'Confirmation Reminder', subject: 'Action required: confirm email',daysOffset: -2  }, // 29 Mar
  { name: 'Launch Announcement',   subject: 'Campaign Manager 2.0 is live',  daysOffset: -2  },
  { name: 'April Preview',         subject: 'What\'s coming in April',       daysOffset: -1  }, // 30 Mar
  { name: 'Referral Program',      subject: 'Invite friends, earn rewards',  daysOffset: -1  },
  { name: 'Today Promo',           subject: 'Today only deal',               daysOffset:  0  }, // 31 Mar
  { name: 'Feedback Request',      subject: 'How are we doing?',             daysOffset:  0  },
  { name: 'April Newsletter',      subject: 'April is here!',                daysOffset:  1  }, // 1 Apr
  { name: 'Quarterly Review',      subject: 'Q1 2026 in numbers',            daysOffset:  1  },
  { name: 'New Feature Drop',      subject: 'Introducing dark mode',         daysOffset:  2  }, // 2 Apr
  { name: 'Webinar Invite',        subject: 'Join our live webinar Apr 10',  daysOffset:  2  },
  { name: 'Reactivation Series',   subject: 'Come back — here\'s what\'s new', daysOffset: 3 }, // 3 Apr
  { name: 'End of Week Wrap',      subject: 'Weekly digest — Apr 4',         daysOffset:  4  }, // 4 Apr
];

export async function seed(knex: Knex): Promise<void> {
  // Find the demo user (created by seed 01)
  const user = await knex('users').where({ email: 'demo@example.com' }).first();
  if (!user) throw new Error('Run seed 01_demo_data first');

  // Remove any campaigns previously inserted by this seed (idempotent)
  const seedNames = CAMPAIGNS.map(c => c.name);
  const existing = await knex('campaigns').whereIn('name', seedNames).select('id');
  if (existing.length) {
    const ids = existing.map((r: { id: number }) => r.id);
    await knex('campaign_recipients').whereIn('campaign_id', ids).delete();
    await knex('campaigns').whereIn('id', ids).delete();
  }

  // Remove extra recipients added by this seed
  const extraEmails = [
    'frank@example.com', 'grace@example.com', 'henry@example.com',
    'iris@example.com',  'jack@example.com',
  ];
  await knex('recipients').whereIn('email', extraEmails).delete();

  // ── Recipients ───────────────────────────────────────────────────────────────
  // Seed 01 already has 5 (alice-eve). Add 5 more for a total of 10.
  const newRecipients = [
    { email: 'frank@example.com',  name: 'Frank'  },
    { email: 'grace@example.com',  name: 'Grace'  },
    { email: 'henry@example.com',  name: 'Henry'  },
    { email: 'iris@example.com',   name: 'Iris'   },
    { email: 'jack@example.com',   name: 'Jack'   },
  ];
  await knex('recipients').insert(newRecipients);

  const allRecipients = await knex('recipients').select('id');
  const allIds: number[] = allRecipients.map((r: { id: number }) => r.id);

  // Reference date: today = 31 Mar 2026
  const TODAY = new Date('2026-03-31T12:00:00Z');

  const DAY = 24 * 60 * 60 * 1000;

  for (let i = 0; i < CAMPAIGNS.length; i++) {
    const def = CAMPAIGNS[i];
    const campaignDate = new Date(TODAY.getTime() + def.daysOffset * DAY);
    const isPast = def.daysOffset < 0;
    const isToday = def.daysOffset === 0;
    const isFuture = def.daysOffset > 0;

    let status: 'draft' | 'scheduled' | 'sent';
    let scheduled_at: string | null = null;

    if (isPast) {
      status = 'sent';
    } else if (isToday) {
      // One draft, one sent for today
      status = i % 2 === 0 ? 'sent' : 'draft';
    } else {
      // Future: alternate scheduled / draft
      status = isFuture && i % 3 !== 0 ? 'scheduled' : 'draft';
      if (status === 'scheduled') {
        scheduled_at = new Date(campaignDate.getTime() + 9 * 60 * 60 * 1000).toISOString();
      }
    }

    const body = RICH_BODIES[i % RICH_BODIES.length];

    const [campaign] = await knex('campaigns')
      .insert({
        name: def.name,
        subject: def.subject,
        body,
        status,
        scheduled_at,
        created_by: user.id,
        created_at: campaignDate.toISOString(),
        updated_at: campaignDate.toISOString(),
      })
      .returning('id');

    // Pick 3–8 random recipients for this campaign
    const count = rand(3, 8);
    const chosen: number[] = shuffle([...allIds]).slice(0, count);

    const sentAt = status === 'sent'
      ? new Date(campaignDate.getTime() + rand(1, 4) * 60 * 60 * 1000).toISOString()
      : null;

    await knex('campaign_recipients').insert(
      chosen.map((rid, idx) => ({
        campaign_id: campaign.id,
        recipient_id: rid,
        status: status === 'sent' ? 'sent' : 'pending',
        sent_at: sentAt,
        // ~40% open rate for sent emails
        opened_at: status === 'sent' && idx < Math.floor(count * 0.4)
          ? new Date(new Date(sentAt!).getTime() + rand(5, 120) * 60 * 1000).toISOString()
          : null,
      }))
    );
  }
}
