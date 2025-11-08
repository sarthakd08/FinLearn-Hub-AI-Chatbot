export const courseCoupons = [
    {
        code: "EARLY_BIRDS_DISCOUNT",
        discount_percentage: "30",
        description: "This is a discount code for the early birds",
        valid_from: "2025-01-01",
        valid_to: "2025-01-31",
        usage_count: 100,
        usage_limit: 100,
        usage_limit_per_user: 1,
        usage_limit_per_user_per_code: 1,
    },
    {
        code: "DIWALI_DISCOUNT",
        discount_percentage: "20",
        description: "This is a discount code for the diwali festival",
        valid_from: "2025-01-01",
        valid_to: "2025-01-15",
        usage_count: 100,
        usage_limit: 100,
        usage_limit_per_user: 1,
    },
    {
        code: "WINTER25",
        discount_percentage: "25",
        description: "Winter special discount for all courses",
        valid_from: "2025-01-01",
        valid_to: "2025-02-28",
        usage_count: 50,
        usage_limit: 200,
        usage_limit_per_user: 1,
    }
];

export const gmailEmails = {
    messages: [
      {
        id: '18c3f21b5d6e789',
        threadId: '18c3f21b5d6e789',
        labelIds: ['INBOX', 'UNREAD'],
        snippet: "Hi, I purchased your JavaScript Masterclass last week but I would like to request a refund. The course content doesn't match what was advertised.",
        payload: {
          headers: [
            { name: 'From', value: 'john.doe@example.com' },
            { name: 'To', value: 'support@finlearnhub.com' },
            { name: 'Subject', value: 'Refund Request - JavaScript Masterclass' },
            { name: 'Date', value: 'Mon, 4 Nov 2024 10:30:00 +0000' }
          ],
          body: {
            data: 'SGVsbG8sIEkgcHVyY2hhc2VkIHlvdXIgSmF2YVNjcmlwdCBjb3Vyc2UgbGFzdCB3ZWVrIGJ1dCB3b3VsZCBsaWtlIHRvIHJlcXVlc3QgYSByZWZ1bmQu'
          }
        }
      },
      {
        id: '18c3f21b5d6e790',
        threadId: '18c3f21b5d6e790',
        labelIds: ['INBOX'],
        snippet: "Hello team, I enrolled in the Financial Planning course but realized it’s not the right level for me. Please initiate a refund.",
        payload: {
          headers: [
            { name: 'From', value: 'anita.patel@example.com' },
            { name: 'To', value: 'support@finlearnhub.com' },
            { name: 'Subject', value: 'Refund Request - Financial Planning Course' },
            { name: 'Date', value: 'Tue, 5 Nov 2024 09:15:00 +0000' }
          ],
          body: {
            data: 'SGVsbG8sIEkgZW5yb2xsZWQgaW4gdGhlIEZpbmFuY2lhbCBQbGFubmluZyBjb3Vyc2UgYnV0IHdvdWxkIGxpa2UgdG8gcmVxdWVzdCBhIHJlZnVuZC4='
          }
        }
      },
      {
        id: '18c3f21b5d6e791',
        threadId: '18c3f21b5d6e791',
        labelIds: ['INBOX'],
        snippet: "Hey, I wanted to know when the next batch of your Mutual Funds Investing course will start?",
        payload: {
          headers: [
            { name: 'From', value: 'rahul.verma@example.com' },
            { name: 'To', value: 'support@finlearnhub.com' },
            { name: 'Subject', value: 'Course Inquiry - Mutual Funds Investing' },
            { name: 'Date', value: 'Wed, 6 Nov 2024 14:00:00 +0000' }
          ],
          body: {
            data: 'SGVsbG8sIFdoZW4gaXMgdGhlIG5leHQgYmF0Y2ggb2YgeW91ciBNdXR1YWwgRnVuZHMgSW52ZXN0aW5nIGNvdXJzZSBzdGFydGluZz8='
          }
        }
      },
      {
        id: '18c3f21b5d6e792',
        threadId: '18c3f21b5d6e792',
        labelIds: ['INBOX', 'READ'],
        snippet: "The Stock Market Basics course was fantastic! The examples made complex topics easy to grasp. Great work!",
        payload: {
          headers: [
            { name: 'From', value: 'neha.sharma@example.com' },
            { name: 'To', value: 'support@finlearnhub.com' },
            { name: 'Subject', value: 'Feedback - Stock Market Basics Course' },
            { name: 'Date', value: 'Thu, 7 Nov 2024 11:45:00 +0000' }
          ],
          body: {
            data: 'VGhlIFN0b2NrIE1hcmtldCBCYXNpY3MgY291cnNlIHdhcyBmYW50YXN0aWMhIEV4YW1wbGVzIG1hZGUgaXQgcmVhbGx5IGVhc3kgdG8gZ3Jhc3Au'
          }
        }
      },
      {
        id: '18c3f21b5d6e793',
        threadId: '18c3f21b5d6e793',
        labelIds: ['INBOX'],
        snippet: "Just wanted to say thank you! Your Mutual Funds course helped me set up my SIPs confidently.",
        payload: {
          headers: [
            { name: 'From', value: 'amit.kapoor@example.com' },
            { name: 'To', value: 'support@finlearnhub.com' },
            { name: 'Subject', value: 'Appreciation - Mutual Funds Investing Course' },
            { name: 'Date', value: 'Fri, 8 Nov 2024 08:20:00 +0000' }
          ],
          body: {
            data: 'SnVzdCB3YW50ZWQgdG8gc2F5IHRoYW5rIHlvdSEgWW91ciBNdXR1YWwgRnVuZHMgY291cnNlIGhlbHBlZCBtZSBzZXQgdXAgbXkgU0lQcyBjb25maWRlbnRseS4='
          }
        }
      }
    ]
  };
  