// Generates supabase/seed.sql from lib/seed-data.json. Run: node scripts/make-seed.mjs
import fs from 'node:fs';
const rows = JSON.parse(fs.readFileSync('lib/seed-data.json', 'utf8'));
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const slug = (r) => `${r.make}-${r.model}-${r.year}-${r.stock_no}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const arr = (a) => `array[${a.map(q).join(', ')}]::text[]`;
let sql = `-- Demo stock for the Kageflow demo dealership. Safe to re-run: it replaces the demo cars (stock numbers DM-1001 to DM-1012).\n`;
sql += `delete from public.vehicles where stock_no like 'DM-10%';\n\n`;
sql += `insert into public.vehicles (slug, stock_no, make, model, variant, year, body, fuel, transmission, drivetrain, mileage_km, colour, price_zar, status, featured, description, features) values\n`;
sql += rows.map((r) => `  (${[q(slug(r)), q(r.stock_no), q(r.make), q(r.model), q(r.variant), r.year, q(r.body), q(r.fuel), q(r.transmission), q(r.drivetrain), r.mileage_km, q(r.colour), r.price_zar, q(r.status), r.featured, q(r.description), arr(r.features)].join(', ')})`).join(',\n');
sql += ';\n';
fs.writeFileSync('supabase/seed.sql', sql);
console.log('wrote supabase/seed.sql with', rows.length, 'vehicles');
