'use client';

/** A <select> inside a server-action form that submits as soon as it changes. */
export default function AutoSubmitSelect({ name, value, options, label }: {
  name: string; value: string; options: { v: string; l: string }[]; label: string;
}) {
  return (
    <select name={name} defaultValue={value} aria-label={label} className="field !w-auto !py-1.5 !text-[13px]"
      onChange={(e) => e.currentTarget.form?.requestSubmit()}>
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}
