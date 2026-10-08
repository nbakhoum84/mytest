import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { CALCULATORS_PAGE, COLORS, RATEHUB } from '../config';
import RatehubWidget from '../components/RatehubWidget';
import { AFFORD, BC_PTT, affordability, balanceAfter, bcTransferTax, cmhcInsurance, downInDollars, num, pmt, yearlySchedule } from '../calc';
import { Breakdown, Chips, DownField, Field, Note, Pick, Result, Toggle, money } from '../components/Inputs';

const TERMS = [10, 15, 20, 25, 30, 40];

const LIST = [
  { key: 'payment', title: 'Mortgage payment', desc: 'Monthly payment with tax, insurance and fees', Comp: PaymentCalc },
  { key: 'afford', title: 'Affordability', desc: 'How much home can you afford on your income?', Comp: AffordCalc },
  { key: 'rates', title: 'Rate comparison', desc: 'Compare mortgage rates side by side', Comp: RatesCalc },
  { key: 'cmhc', title: 'CMHC insurance', desc: 'Mortgage default insurance premium', Comp: CmhcCalc },
  { key: 'ptt', title: 'Land transfer tax (BC)', desc: 'BC Property Transfer Tax', Comp: TransferTaxCalc },
];

export default function CalculatorsScreen({ goTo }) {
  const [active, setActive] = useState(null);
  const [mode, setMode] = useState('Ratehub');
  const item = LIST.find((l) => l.key === active);

  if (!item) {
    return (
      <ScrollView contentContainerStyle={styles.pad}>
        {LIST.map((l) => (
          <TouchableOpacity key={l.key} style={styles.tile} onPress={() => { setMode('Ratehub'); setActive(l.key); }}>
            <Text style={styles.tileTitle}>{l.title}</Text>
            <Text style={styles.tileDesc}>{l.desc}</Text>
          </TouchableOpacity>
        ))}
        <Note>Calculators by Ratehub.ca. Estimates only; confirm figures with your lender.</Note>
      </ScrollView>
    );
  }
  const { Comp } = item;
  const widget = RATEHUB[item.key];
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.head}>
        <TouchableOpacity onPress={() => setActive(null)} hitSlop={10}><Text style={styles.back}>‹ All calculators</Text></TouchableOpacity>
        <Chips options={['Ratehub', 'Quick']} value={mode} onChange={setMode} />
      </View>
      {mode === 'Ratehub' ? (
        <View style={{ flex: 1 }}>
          <RatehubWidget widget={widget} />
          <TouchableOpacity style={styles.siteLink} onPress={() => WebBrowser.openBrowserAsync(`${CALCULATORS_PAGE}#${widget.slug}`)}>
            <Text style={styles.linkText}>Not loading? Open on the website</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>{item.title}</Text>
          <Comp goTo={goTo} />
        </ScrollView>
      )}
    </View>
  );
}

function PaymentCalc() {
  const [price, setPrice] = useState('1200000');
  const [down, setDown] = useState('20');
  const [mode, setMode] = useState('%');
  const [years, setYears] = useState(25);
  const [rate, setRate] = useState('4.5');
  const [tax, setTax] = useState('3600');
  const [taxMode, setTaxMode] = useState('$');
  const [ins, setIns] = useState('1200');
  const [hoa, setHoa] = useState('0');
  const [showSched, setShowSched] = useState(false);

  const p = num(price);
  const d = Math.min(downInDollars(p, num(down), mode), p);
  const loan = Math.max(p - d, 0);
  const pi = pmt(loan, num(rate), years);
  const taxMonthly = (taxMode === '%' ? (p * num(tax)) / 100 : num(tax)) / 12;
  const total = pi + taxMonthly + num(ins) / 12 + num(hoa);
  const interest = pi * years * 12 - loan;

  return (
    <View>
      <Field label="Home price ($)" value={price} onChange={setPrice} />
      <DownField value={down} onChange={setDown} mode={mode} onMode={setMode} />
      <Pick label="Loan term (years)" options={TERMS} value={years} onChange={setYears} />
      <Field label="Interest rate (%)" value={rate} onChange={setRate} />
      <View style={styles.rowBetween}>
        <Text style={styles.small}>Property tax per year</Text>
        <Chips options={['$', '%']} value={taxMode} onChange={setTaxMode} />
      </View>
      <Field label="" value={tax} onChange={setTax} />
      <Field label="Home insurance ($ / year)" value={ins} onChange={setIns} />
      <Field label="Condo / HOA fees ($ / month)" value={hoa} onChange={setHoa} />

      <Result title="Estimated monthly payment" value={money(total)} lines={[`Mortgage: ${money(loan)} · Total interest: ${money(Math.max(interest, 0))}`]} />
      <Breakdown rows={[
        ['Principal & interest', money(pi)],
        ['Property tax', money(taxMonthly)],
        ['Home insurance', money(num(ins) / 12)],
        ['Condo / HOA fees', money(num(hoa))],
        ['Total per month', money(total), true],
        [`Total over ${years} years`, money(total * years * 12), true],
      ]} />
      <TouchableOpacity style={styles.linkBtn} onPress={() => setShowSched(!showSched)}>
        <Text style={styles.linkText}>{showSched ? 'Hide payment schedule' : 'Show payment schedule'}</Text>
      </TouchableOpacity>
      {showSched && (
        <View style={styles.table}>
          <TRow cells={['Year', 'Principal', 'Interest', 'Balance']} head />
          {yearlySchedule(loan, num(rate), years).map((r) => (
            <TRow key={r.year} cells={[r.year, money(r.principal), money(r.interest), money(r.balance)]} />
          ))}
        </View>
      )}
      <Note>Canadian fixed-rate mortgage, compounded semi-annually. Schedule shows principal and interest only.</Note>
    </View>
  );
}

function AffordCalc({ goTo }) {
  const [income, setIncome] = useState('150000');
  const [down, setDown] = useState('150000');
  const [debts, setDebts] = useState('500');
  const [years, setYears] = useState(25);
  const [rate, setRate] = useState('4.5');
  const [taxRate, setTaxRate] = useState('0.3');
  const [ins, setIns] = useState('1200');
  const [hoa, setHoa] = useState('0');

  const r = affordability({ income: num(income), down: num(down), debts: num(debts), years, ratePct: num(rate), taxRatePct: num(taxRate), insurance: num(ins), hoa: num(hoa) });
  const downPct = r.price > 0 ? (num(down) / r.price) * 100 : 0;
  const ok = r.price > 0;

  return (
    <View>
      <Field label="Annual income ($)" value={income} onChange={setIncome} />
      <Field label="Down payment ($)" value={down} onChange={setDown} />
      <Field label="Other monthly debts ($)" value={debts} onChange={setDebts} />
      <Pick label="Loan term (years)" options={TERMS} value={years} onChange={setYears} />
      <Field label="Interest rate (%)" value={rate} onChange={setRate} />
      <Field label="Property tax rate (% of price per year)" value={taxRate} onChange={setTaxRate} />
      <Field label="Home insurance ($ / year)" value={ins} onChange={setIns} />
      <Field label="Condo / HOA fees ($ / month)" value={hoa} onChange={setHoa} />

      <Result title="Maximum home price" value={ok ? money(r.price) : '$0'} tone={ok ? undefined : 'warn'}
        lines={[ok ? `Mortgage: ${money(r.loan)} · Down payment: ${downPct.toFixed(1)}%` : 'Income is too low for these inputs.']} />
      {ok && (
        <Breakdown rows={[
          ['Principal & interest', money(r.payment)],
          ['Property tax', money(r.tax)],
          ['Home insurance', money(r.insurance)],
          ['Condo / HOA fees', money(r.hoa)],
          ['Total per month', money(r.total), true],
          ['Housing ratio (GDS)', `${r.gdsPct.toFixed(0)}%`],
          ['Debt ratio (TDS)', `${r.tdsPct.toFixed(0)}%`],
        ]} />
      )}
      {ok && downPct < 20 && <Note>Under 20% down, mortgage insurance applies and adds to the mortgage. Use the CMHC calculator to estimate it.</Note>}
      {ok && <TouchableOpacity style={styles.linkBtn} onPress={() => goTo('browse')}><Text style={styles.linkText}>View affordable properties</Text></TouchableOpacity>}
      <Note>
        Assumes lenders' common limits (housing costs up to {AFFORD.gds * 100}% and total debt up to {AFFORD.tds * 100}% of gross income), qualified at {r.qualRate.toFixed(2)}% (your rate + 2%, minimum 5.25%). Half of condo fees count toward the limits. Actual approval is up to your lender.
      </Note>
    </View>
  );
}

function RatesCalc() {
  const [loan, setLoan] = useState('960000');
  const [years, setYears] = useState(25);
  const [term, setTerm] = useState(5);
  const [rates, setRates] = useState(['4.19', '4.49', '4.89']);
  const L = num(loan);
  const rows = rates.map((r, i) => {
    const rate = num(r);
    const m = pmt(L, rate, years);
    const paidInTerm = m * term * 12;
    const bal = balanceAfter(L, rate, years, term * 12);
    return { name: 'ABC'[i], rate, monthly: m, interest: paidInTerm - (L - bal), balance: bal };
  });
  const best = rows.reduce((a, b) => (b.interest < a.interest ? b : a), rows[0]);
  const worst = rows.reduce((a, b) => (b.interest > a.interest ? b : a), rows[0]);

  return (
    <View>
      <Field label="Mortgage amount ($)" value={loan} onChange={setLoan} />
      <Pick label="Amortization (years)" options={[15, 20, 25, 30]} value={years} onChange={setYears} />
      <Pick label="Term (years)" options={[1, 2, 3, 4, 5, 7, 10]} value={term} onChange={setTerm} />
      {rates.map((r, i) => (
        <Field key={i} label={`Rate ${'ABC'[i]} (%)`} value={r} onChange={(v) => setRates(rates.map((x, j) => (j === i ? v : x)))} />
      ))}
      <View style={styles.table}>
        <TRow cells={['', 'Rate', 'Monthly', `Interest (${term}y)`]} head />
        {rows.map((r) => (
          <TRow key={r.name} cells={[r.name, `${r.rate}%`, money(r.monthly), money(r.interest)]} highlight={r === best} />
        ))}
      </View>
      <Result title={`Best option over ${term} years`} value={`Rate ${best.name} · ${best.rate}%`}
        lines={[`Saves ${money(worst.interest - best.interest)} in interest vs the highest rate`, `Balance after ${term} years: ${money(best.balance)}`]} />
      <Note>Assumes the rate stays fixed for the whole term and payments are monthly. Does not include fees or penalties.</Note>
    </View>
  );
}

function CmhcCalc() {
  const [price, setPrice] = useState('900000');
  const [down, setDown] = useState('10');
  const [mode, setMode] = useState('%');
  const [years, setYears] = useState(25);
  const p = num(price);
  const d = Math.min(downInDollars(p, num(down), mode), p);
  const r = cmhcInsurance({ price: p, down: d, amortYears: years });
  const blocked = r.status === 'blocked';

  return (
    <View>
      <Field label="Home price ($)" value={price} onChange={setPrice} />
      <DownField value={down} onChange={setDown} mode={mode} onMode={setMode} />
      <Pick label="Amortization (years)" options={[25, 30]} value={years} onChange={setYears} />
      <Result title="Insurance premium" value={blocked ? 'Not available' : money(r.premium)} tone={blocked ? 'warn' : undefined}
        lines={[r.message || `Premium rate ${r.ratePct}% of the mortgage (down payment ${r.downPct.toFixed(1)}%)`]} />
      {!blocked && (
        <Breakdown rows={[
          ['Home price', money(p)],
          ['Down payment', money(d)],
          ['Mortgage before premium', money(r.loan)],
          ['Insurance premium', money(r.premium)],
          ['Total mortgage', money(r.total), true],
        ]} />
      )}
      <Note>Premium is normally added to the mortgage. Uses CMHC tiers: 4.00% (5–9.99% down), 3.10% (10–14.99%), 2.80% (15–19.99%), plus 0.20% when amortization is over 25 years. Homes of $1.5M+ need 20% down. Confirm with your lender.</Note>
    </View>
  );
}

function TransferTaxCalc() {
  const [price, setPrice] = useState('1200000');
  const [first, setFirst] = useState(false);
  const [newBuild, setNewBuild] = useState(false);
  const r = bcTransferTax({ price: num(price), firstTime: first, newBuild });

  return (
    <View>
      <Field label="Purchase price ($)" value={price} onChange={setPrice} />
      <Toggle label="First-time home buyer" value={first} onChange={setFirst} />
      <Toggle label="Newly built home" value={newBuild} onChange={setNewBuild} />
      <Result title="Property transfer tax" value={money(r.payable)} lines={[r.note || `Tax before any exemption: ${money(r.full)}`]} />
      <Breakdown rows={[
        ['Purchase price', money(num(price))],
        ['Tax before exemptions', money(r.full)],
        ['Tax payable', money(r.payable), true],
      ]} />
      <Note>
        BC rates: 1% on the first $200,000, 2% up to $2M, 3% above $2M, plus 2% on residential value above $3M. First-time buyer exemption: full up to ${BC_PTT.firstTimeFull.toLocaleString('en-CA')}, partial to ${BC_PTT.firstTimePartialTo.toLocaleString('en-CA')}. New-home exemption: full up to ${BC_PTT.newBuildFull.toLocaleString('en-CA')}, partial to ${BC_PTT.newBuildPartialTo.toLocaleString('en-CA')}. Eligibility rules apply, and thresholds change, so verify with the BC government.
      </Note>
    </View>
  );
}

function TRow({ cells, head, highlight }) {
  return (
    <View style={[styles.trow, head && styles.thead, highlight && styles.thl]}>
      {cells.map((c, i) => (
        <Text key={i} style={[styles.tcell, i === 0 && { flex: 0.6 }, head && styles.tbold]}>{c}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 16 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  back: { color: COLORS.primary, fontSize: 16, marginBottom: 6 },
  siteLink: { alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  h1: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  tile: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 10 },
  tileTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  tileDesc: { color: COLORS.muted, marginTop: 2 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  small: { color: COLORS.muted },
  linkBtn: { paddingVertical: 10 },
  linkText: { color: COLORS.primary, fontWeight: '600', fontSize: 16 },
  table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, overflow: 'hidden', marginBottom: 12 },
  trow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  thead: { backgroundColor: COLORS.card, borderTopWidth: 0 },
  thl: { backgroundColor: '#dcfce7' },
  tcell: { flex: 1, fontSize: 13, color: COLORS.text },
  tbold: { fontWeight: '700' },
});
