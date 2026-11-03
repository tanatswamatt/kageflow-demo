/** The fictional dealership this demo sells for. Change these to rebrand the demo. */
export const SITE = {
  name: 'Demo Motors',
  tagline: 'Quality pre-owned cars, priced honestly.',
  city: 'Johannesburg',
  address: '12 Demo Avenue, Sandton, Johannesburg',
  phone: '+27 10 000 0000',
  whatsapp: '27100000000',
  email: 'sales@demomotors.example',
  hours: 'Mon–Fri 08:00–17:30 · Sat 08:30–13:00',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://demo.kageflow.co.za',
};

/** Kageflow contact for prospects who want this for their own dealership. */
export const KAGEFLOW = {
  site: 'https://www.kageflow.co.za',
  demoEmail: 'sales@kageflow.co.za',
};
