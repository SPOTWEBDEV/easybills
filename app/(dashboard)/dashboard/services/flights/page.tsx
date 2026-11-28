"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Mail, Phone, Plane, User } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { FormField, SubmitButton } from "@/components/dashboard/form-field";
import { usePinPrompt } from "@/components/dashboard/pin-prompt-context";
import { useAuth } from "@/components/dashboard/auth-context";
import { FeatureGate } from "@/components/dashboard/feature-gate";
import { Box, Card, ErrorText, Label, PillSelect } from "@/components/dashboard/ui-bits";
import {
  flightsApi, isPending, type BookPassenger, type FlightOffer, type FlightSearchResult, type SearchPassenger,
} from "@/lib/api/extra-services";
import { ApiError } from "@/lib/api-client";
import { purchaseWithPinRetry } from "@/lib/purchase-with-pin-retry";
import { friendlyError, goPending, handleActionError } from "@/lib/action-helpers";
import { FLAGS } from "@/lib/feature-flags";
import { formatDateTime, formatMoney } from "@/lib/format";
import { cn, formatNaira } from "@/lib/utils";

const CABINS = [
  { value: "", label: "Any cabin" }, { value: "economy", label: "Economy" }, { value: "premium_economy", label: "Premium economy" },
  { value: "business", label: "Business" }, { value: "first", label: "First" },
];
const priceOf = (o: FlightOffer) => (o.currency === "NGN" ? formatNaira(o.price) : formatMoney(o.price, o.currency));
const today = () => new Date().toISOString().slice(0, 10);

export default function FlightsPage() {
  return (
    <FeatureGate enabled={FLAGS.flights} title="Book Flight" subtitle="Search and book flights">
      <Flights />
    </FeatureGate>
  );
}

type Step = "search" | "offers" | "passengers";

function Flights() {
  const [step, setStep] = useState<Step>("search");
  const [result, setResult] = useState<FlightSearchResult | null>(null);
  const [offer, setOffer] = useState<FlightOffer | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const backToSearch = (msg?: string) => { setStep("search"); setOffer(null); setNotice(msg ?? null); };

  return (
    <div className="space-y-6">
      <SubPageHeader title="Book Flight" subtitle="Search and book flights" back="/dashboard/services" />
      <Link href="/dashboard/services/flights/trips" className="flex items-center justify-between rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 text-sm font-bold text-brand-500">
        My trips <span aria-hidden>→</span>
      </Link>
      {notice && <p role="alert" className="rounded-2xl bg-amber-500/10 p-3 text-center text-sm text-amber-500">{notice}</p>}
      {step === "search" && <SearchForm onResult={(r) => { setResult(r); setNotice(null); setStep("offers"); }} />}
      {step === "offers" && result && (
        <Offers result={result} onBack={() => backToSearch()} onExpired={() => backToSearch("That offer has expired. Please search again.")}
          onPick={(o) => { setOffer(o); setStep("passengers"); }} />
      )}
      {step === "passengers" && result && offer && (
        <PassengerForm result={result} offer={offer} onBack={() => setStep("offers")} onExpired={() => backToSearch("That offer has expired. Please search again.")} />
      )}
    </div>
  );
}

/* -------------------------------- Search -------------------------------- */
function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint?: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  const btn = "h-8 w-8 rounded-full border text-lg font-bold disabled:opacity-40";
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-[rgb(var(--bg-elevated))] px-4 py-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {hint && <p className="text-xs text-[rgb(var(--fg-muted))]">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Fewer ${label}`} className={btn} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
        <span className="w-5 text-center font-bold">{value}</span>
        <button type="button" aria-label={`More ${label}`} className={btn} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

function SearchForm({ onResult }: { onResult: (r: FlightSearchResult) => void }) {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [oneWay, setOneWay] = useState(false);
  const [cabin, setCabin] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState<number[]>([]);
  const [infants, setInfants] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[A-Z]{3}$/.test(origin)) next.origin = "Use a 3-letter airport code, e.g. LOS";
    if (!/^[A-Z]{3}$/.test(destination)) next.destination = "Use a 3-letter airport code, e.g. LHR";
    if (origin && origin === destination) next.destination = "Choose a different destination";
    if (!departureDate) next.departureDate = "Pick a departure date";
    if (!oneWay && !returnDate) next.returnDate = "Pick a return date or choose one-way";
    if (!oneWay && returnDate && departureDate && returnDate < departureDate) next.returnDate = "Return must be after departure";
    if (infants > adults) next.passengers = "Each infant needs an adult (infants cannot exceed adults)";
    if (adults + children.length + infants > 9) next.passengers = "You can book up to 9 passengers at a time";
    if (Object.keys(next).length) return setErrors(next);
    setErrors({}); setLoading(true);
    try {
      const r = await flightsApi.search({
        origin, destination, departureDate, ...(oneWay ? {} : { returnDate }), ...(cabin ? { cabinClass: cabin } : {}),
        passengers: { adults, children, infants },
      });
      onResult(r);
    } catch (err) { handleActionError(err, router, (m) => setErrors({ form: m })); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div role="radiogroup" aria-label="Trip type" className="grid grid-cols-2 gap-3">
        {[{ v: false, l: "Round trip" }, { v: true, l: "One way" }].map((o) => (
          <button key={o.l} type="button" role="radio" aria-checked={oneWay === o.v} onClick={() => setOneWay(o.v)}
            className={cn("rounded-full border py-3 text-sm font-semibold", oneWay === o.v ? "border-brand-500 bg-brand-500/10 text-brand-500" : "bg-[rgb(var(--bg-elevated))] text-[rgb(var(--fg-muted))]")}>{o.l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="From" icon={Plane} placeholder="LOS" maxLength={3} autoCapitalize="characters" value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))} error={errors.origin} />
        <FormField label="To" icon={Plane} placeholder="LHR" maxLength={3} autoCapitalize="characters" value={destination} onChange={(e) => setDestination(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))} error={errors.destination} />
      </div>
      <FormField label="Departure" icon={Calendar} type="date" min={today()} value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} error={errors.departureDate} />
      {!oneWay && <FormField label="Return" icon={Calendar} type="date" min={departureDate || today()} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} error={errors.returnDate} />}
      <PillSelect label="Cabin" value={cabin} onChange={setCabin} options={CABINS} />

      <div className="space-y-3">
        <Label>Passengers</Label>
        <Stepper label="Adults" hint="18+" value={adults} min={1} max={9} onChange={setAdults} />
        <Stepper label="Infants" hint="Under 2, on an adult's lap" value={infants} min={0} max={9} onChange={setInfants} />
        <div className="space-y-2 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-semibold">Children</p><p className="text-xs text-[rgb(var(--fg-muted))]">Ages 2–17</p></div>
            <button type="button" onClick={() => setChildren((c) => [...c, 8])} className="text-sm font-bold text-brand-500">+ Add child</button>
          </div>
          {children.map((age, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm">Child {i + 1}</span>
              <select aria-label={`Child ${i + 1} age`} value={age} onChange={(e) => setChildren((c) => c.map((a, j) => (j === i ? Number(e.target.value) : a)))}
                className="flex-1 rounded-full border bg-transparent px-4 py-2 text-sm outline-none focus:border-brand-500">
                {Array.from({ length: 16 }, (_, k) => k + 2).map((a) => <option key={a} value={a}>{a} years</option>)}
              </select>
              <button type="button" onClick={() => setChildren((c) => c.filter((_, j) => j !== i))} className="text-sm font-bold text-red-500">Remove</button>
            </div>
          ))}
        </div>
        {errors.passengers && <p className="text-xs text-red-500">{errors.passengers}</p>}
      </div>
      <ErrorText>{errors.form}</ErrorText>
      <SubmitButton loading={loading}>Search flights</SubmitButton>
    </form>
  );
}

/* -------------------------------- Offers -------------------------------- */
function Offers({ result, onBack, onPick, onExpired }: { result: FlightSearchResult; onBack: () => void; onPick: (o: FlightOffer) => void; onExpired: () => void }) {
  const router = useRouter();
  const [picking, setPicking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refresh the offer when the user opens it: this also checks it hasn't expired.
  const pick = async (o: FlightOffer) => {
    setError(null); setPicking(o.id);
    try { onPick(await flightsApi.offer(o.id)); }
    catch (err) {
      if (err instanceof ApiError && err.status === 422) onExpired();
      else handleActionError(err, router, setError);
    } finally { setPicking(null); }
  };

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-500"><ArrowLeft className="h-4 w-4" /> Change search</button>
      <ErrorText>{error}</ErrorText>
      {result.offers.length === 0 ? <Box>No flights found for these dates. Try different dates or airports.</Box> : (
        <div className="space-y-3">
          {result.offers.map((o) => (
            <button key={o.id} type="button" onClick={() => pick(o)} disabled={picking !== null}
              className="block w-full space-y-3 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 text-left transition-colors hover:border-brand-500/50 disabled:opacity-60">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {o.airlineLogoUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={o.airlineLogoUrl} alt="" className="h-8 w-8 rounded bg-white object-contain" />
                    : <span className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/15"><Plane className="h-4 w-4 text-blue-500" /></span>}
                  <p className="text-sm font-bold">{o.airline}</p>
                </div>
                <p className="font-display text-lg font-bold text-brand-500">{picking === o.id ? "…" : priceOf(o)}</p>
              </div>
              {o.slices.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold">{s.origin} → {s.destination}</p>
                    <p className="text-xs text-[rgb(var(--fg-muted))]">{formatDateTime(s.departureAt)} – {formatDateTime(s.arrivalAt)}</p>
                  </div>
                  <span className="text-xs font-semibold text-[rgb(var(--fg-muted))]">{s.stops === 0 ? "Nonstop" : `${s.stops} stop${s.stops > 1 ? "s" : ""}`}</span>
                </div>
              ))}
              <p className="text-xs text-[rgb(var(--fg-muted))]">Total for {o.passengerCount} passenger{o.passengerCount > 1 ? "s" : ""}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Passengers ------------------------------ */
type Kind = "adult" | "child" | "infant";
type Row = { id: string; kind: Kind; age: number | null; title: string; gender: string; givenName: string; familyName: string; bornOn: string; email: string; phone: string };
const RANK: Record<Kind, number> = { adult: 0, child: 1, infant: 2 };

function kindOf(p: SearchPassenger): Kind {
  const t = (p.type ?? "").toLowerCase();
  if (t === "adult") return "adult";
  if (t.includes("infant") || (p.age !== null && p.age < 2)) return "infant";
  return "child";
}

function PassengerForm({ result, offer, onBack, onExpired }: { result: FlightSearchResult; offer: FlightOffer; onBack: () => void; onExpired: () => void }) {
  const router = useRouter();
  const { requestPin } = usePinPrompt();
  const { user } = useAuth();
  const u = user as { email?: string; phone?: string } | null;

  // Each Duffel passenger id must map to a real person: adults first, then children (in order given), then infants.
  const [rows, setRows] = useState<Row[]>(() =>
    result.passengers
      .map((p, i) => ({ p, i, k: kindOf(p) }))
      .sort((a, b) => RANK[a.k] - RANK[b.k] || a.i - b.i)
      .map(({ p, k }, idx) => ({
        id: p.id, kind: k, age: p.age, title: "mr", gender: "m", givenName: "", familyName: "", bornOn: "",
        email: idx === 0 ? u?.email ?? "" : "", phone: idx === 0 ? u?.phone ?? "" : "",
      })));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const upd = (i: number, k: keyof Row, v: string) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const labelFor = (r: Row, i: number) => {
    const n = rows.filter((x, j) => x.kind === r.kind && j <= i).length;
    return r.kind === "adult" ? `Adult ${n}` : r.kind === "child" ? `Child ${n}${r.age ? ` (age ${r.age})` : ""}` : `Infant ${n}`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    rows.forEach((r, i) => {
      if (r.givenName.trim().length < 2) next[`${i}.givenName`] = "Enter first name as on passport";
      if (r.familyName.trim().length < 2) next[`${i}.familyName`] = "Enter last name as on passport";
      if (!r.bornOn) next[`${i}.bornOn`] = "Enter date of birth";
      if (!/^\S+@\S+\.\S+$/.test(r.email)) next[`${i}.email`] = "Each passenger needs their own valid email";
      if (!/^\+?\d{10,15}$/.test(r.phone.replace(/[\s-]/g, ""))) next[`${i}.phone`] = "Enter a valid phone number";
    });
    const emails = rows.map((r) => r.email.trim().toLowerCase());
    emails.forEach((m, i) => { if (m && emails.indexOf(m) !== i) next[`${i}.email`] = "Each passenger needs a different email"; });
    if (Object.keys(next).length) return setErrors(next);
    setErrors({}); setLoading(true);

    try {
      // Offers go stale fast: re-check right before paying.
      const fresh = await flightsApi.offer(offer.id);
      const infants = rows.filter((r) => r.kind === "infant");
      let adultIdx = 0;
      const passengers: BookPassenger[] = rows.map((r) => {
        const base: BookPassenger = {
          duffelPassengerId: r.id, title: r.title, gender: r.gender, givenName: r.givenName.trim(), familyName: r.familyName.trim(),
          bornOn: r.bornOn, email: r.email.trim(), phone: r.phone.replace(/[\s-]/g, ""),
        };
        if (r.kind === "adult") { const inf = infants[adultIdx++]; if (inf) base.responsibleForInfantId = inf.id; }
        return base;
      });
      const res = await purchaseWithPinRetry((pin) => flightsApi.book({ offerId: fresh.id, passengers, transactionPin: pin }), requestPin);
      if (res === null) return;
      if (isPending(res)) return goPending(router, res, "Booking in progress");
      router.replace(`/dashboard/services/flights/trips/${res.booking.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && /expired/i.test(err.message)) return onExpired();
      handleActionError(err, router, (m) => setErrors({ form: m }), { purchase: true });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-500"><ArrowLeft className="h-4 w-4" /> Back to flights</button>
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">{offer.airline}</p>
          <p className="text-xs text-[rgb(var(--fg-muted))]">{offer.slices.map((s) => `${s.origin}→${s.destination}`).join(" · ")}</p>
        </div>
        <p className="font-display text-lg font-bold text-brand-500">{priceOf(offer)}</p>
      </Card>

      {rows.map((r, i) => (
        <section key={r.id} className="space-y-4 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4">
          <p className="inline-flex items-center gap-2 font-display text-base font-bold"><User className="h-4 w-4" /> {labelFor(r, i)}</p>
          <div className="grid grid-cols-2 gap-3">
            <PillSelect label="Title" value={r.title} onChange={(v) => upd(i, "title", v)} options={[{ value: "mr", label: "Mr" }, { value: "mrs", label: "Mrs" }, { value: "ms", label: "Ms" }, { value: "miss", label: "Miss" }, { value: "dr", label: "Dr" }]} />
            <PillSelect label="Gender" value={r.gender} onChange={(v) => upd(i, "gender", v)} options={[{ value: "m", label: "Male" }, { value: "f", label: "Female" }]} />
          </div>
          <FormField label="First name" icon={User} value={r.givenName} onChange={(e) => upd(i, "givenName", e.target.value)} error={errors[`${i}.givenName`]} />
          <FormField label="Last name" icon={User} value={r.familyName} onChange={(e) => upd(i, "familyName", e.target.value)} error={errors[`${i}.familyName`]} />
          <FormField label="Date of birth" icon={Calendar} type="date" max={today()} value={r.bornOn} onChange={(e) => upd(i, "bornOn", e.target.value)} error={errors[`${i}.bornOn`]} />
          <FormField label="Email" icon={Mail} type="email" value={r.email} onChange={(e) => upd(i, "email", e.target.value)} error={errors[`${i}.email`]} />
          <FormField label="Phone" icon={Phone} type="tel" placeholder="+2348012345678" value={r.phone} onChange={(e) => upd(i, "phone", e.target.value)} error={errors[`${i}.phone`]} />
        </section>
      ))}

      <p className="text-xs text-[rgb(var(--fg-muted))]">
        Names must match each passenger&apos;s passport. Every passenger needs their own email to complete check-in. Passport details aren&apos;t collected here, and some international fares may require them.
      </p>
      <ErrorText>{errors.form}</ErrorText>
      <SubmitButton loading={loading}>Pay {priceOf(offer)} from wallet</SubmitButton>
    </form>
  );
}
