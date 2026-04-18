import { useState, useMemo } from "react";

const MONTHLY_RATE = 200000;
const TODAY = new Date(); TODAY.setHours(0,0,0,0);

function parseDate(str) {
  if (!str) return null;
  const parts = str.split("/");
  if (parts.length !== 3) return null;
  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
}
function formatDate(date) {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2,"0");
  const m = String(date.getMonth()+1).padStart(2,"0");
  return `${d}/${m}/${date.getFullYear()}`;
}
function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + Number(n));
  return d;
}
function fmt(n) {
  if (n === "" || n === null || n === undefined) return "";
  return "TSh " + Number(n).toLocaleString();
}
function daysLeft(nextDate) {
  if (!nextDate) return null;
  return Math.ceil((nextDate - TODAY) / 86400000);
}

const STORAGE_KEY = "rent_tracker_tenants";
let _id = 100;
function genId() { return ++_id; }

function loadTenants() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return [
    { id:1, shopNo:"1", name:"",                      phone:"", monthsPaid:6, datePaid:"14/02/2026", coverageStart:"01/01/2026", account:"1.52631E+11" },
    { id:2, shopNo:"2", name:"MICHAEL PETRO MONGASYO", phone:"", monthsPaid:6, datePaid:"28/03/2026", coverageStart:"01/01/2026", account:"1.52631E+11" },
    { id:3, shopNo:"3", name:"TUMAINI JEREMIAH SUSU",  phone:"", monthsPaid:6, datePaid:"29/03/2026", coverageStart:"01/01/2026", account:"1.52814E+11" },
    { id:4, shopNo:"4", name:"",                      phone:"", monthsPaid:6, datePaid:"29/03/2026", coverageStart:"01/01/2026", account:"1.52814E+11" },
    { id:5, shopNo:"5", name:"",                      phone:"", monthsPaid:4, datePaid:"09/03/2026", coverageStart:"01/01/2026", account:"" },
  ];
}

const BLANK = { shopNo:"", name:"", phone:"", monthsPaid:"", datePaid:"", coverageStart:"", account:"" };

const S = {
  app:       { minHeight:"100vh", background:"#0d1117", color:"#e6edf3", fontFamily:"'Courier New', monospace", padding:0 },
  header:    { background:"#161b22", borderBottom:"2px solid #f0883e", padding:"18px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 },
  title:     { fontSize:20, fontWeight:700, color:"#f0883e", letterSpacing:2, margin:0 },
  sub:       { fontSize:11, color:"#8b949e", marginTop:2 },
  body:      { padding:"20px 16px" },
  alertBox:  { background:"#1a0a00", border:"2px solid #f0883e", borderRadius:8, marginBottom:20, overflow:"hidden" },
  alertHead: { background:"#f0883e", color:"#0d1117", padding:"10px 16px", fontWeight:700, fontSize:13, display:"flex", justifyContent:"space-between", alignItems:"center" },
  alertItem: { padding:"10px 16px", borderBottom:"1px solid #2a1500", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 },
  alertName: { fontWeight:700, color:"#ffa657", fontSize:13 },
  alertInfo: { fontSize:12, color:"#e6edf3", marginTop:3 },
  statsRow:  { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:20 },
  statCard:  { background:"#161b22", border:"1px solid #30363d", borderRadius:8, padding:"14px 18px" },
  statLabel: { fontSize:10, color:"#8b949e", marginBottom:4, letterSpacing:1 },
  statVal:   { fontSize:22, fontWeight:700, color:"#58a6ff" },
  statSub:   { fontSize:10, color:"#8b949e", marginTop:2 },
  toolbar:   { display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" },
  input:     { background:"#0d1117", border:"1px solid #30363d", borderRadius:6, color:"#e6edf3", padding:"7px 12px", fontSize:13, outline:"none", fontFamily:"inherit" },
  btnPrim:   { background:"#f0883e", color:"#0d1117", border:"none", borderRadius:6, padding:"8px 18px", fontWeight:700, fontSize:13, cursor:"pointer" },
  btnSec:    { background:"#21262d", color:"#e6edf3", border:"1px solid #30363d", borderRadius:6, padding:"8px 16px", fontSize:13, cursor:"pointer" },
  btnGreen:  { background:"#238636", color:"#fff", border:"none", borderRadius:6, padding:"8px 16px", fontWeight:700, fontSize:13, cursor:"pointer" },
  btnSmall:  { background:"#21262d", color:"#58a6ff", border:"1px solid #30363d", borderRadius:4, padding:"4px 9px", fontSize:11, cursor:"pointer" },
  tableWrap: { overflowX:"auto", borderRadius:8, border:"1px solid #30363d" },
  table:     { width:"100%", borderCollapse:"collapse", fontSize:12 },
  th:        { background:"#161b22", color:"#8b949e", padding:"10px 10px", textAlign:"left",   borderBottom:"2px solid #f0883e", whiteSpace:"nowrap", fontSize:11, letterSpacing:0.5 },
  thR:       { background:"#161b22", color:"#8b949e", padding:"10px 10px", textAlign:"right",  borderBottom:"2px solid #f0883e", whiteSpace:"nowrap", fontSize:11 },
  thC:       { background:"#161b22", color:"#8b949e", padding:"10px 10px", textAlign:"center", borderBottom:"2px solid #f0883e", whiteSpace:"nowrap", fontSize:11 },
  td:        { padding:"9px 10px", borderBottom:"1px solid #21262d", whiteSpace:"nowrap", verticalAlign:"middle" },
  tdR:       { padding:"9px 10px", borderBottom:"1px solid #21262d", textAlign:"right",  whiteSpace:"nowrap", verticalAlign:"middle" },
  tdC:       { padding:"9px 10px", borderBottom:"1px solid #21262d", textAlign:"center", whiteSpace:"nowrap", verticalAlign:"middle" },
  totalRow:  { background:"#161b22", fontWeight:700, color:"#f0883e" },
  paidBadge: { display:"inline-block", background:"#1a4a1a", color:"#3fb950", border:"1px solid #3fb950", borderRadius:4, padding:"3px 10px", fontWeight:700, fontSize:11 },
  nopayBadge:{ display:"inline-block", background:"#3d0000", color:"#f85149", border:"1px solid #f85149", borderRadius:4, padding:"3px 10px", fontWeight:700, fontSize:11 },
  overBadge: { display:"inline-block", background:"#3d1a00", color:"#f0883e", border:"1px solid #f0883e", borderRadius:4, padding:"3px 10px", fontWeight:700, fontSize:11 },
  overlay:   { position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 },
  modal:     { background:"#161b22", border:"1px solid #30363d", borderRadius:10, padding:28, width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto" },
  modalTitle:{ fontSize:15, fontWeight:700, color:"#f0883e", marginBottom:20, letterSpacing:1 },
  fRow:      { marginBottom:13 },
  fRow2:     { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  label:     { display:"block", fontSize:11, color:"#8b949e", marginBottom:5, letterSpacing:0.5 },
  fInput:    { width:"100%", background:"#0d1117", border:"1px solid #30363d", borderRadius:6, color:"#e6edf3", padding:"8px 12px", fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" },
  toast:     { position:"fixed", bottom:24, right:24, background:"#238636", color:"#fff", padding:"12px 20px", borderRadius:8, fontWeight:700, fontSize:13, zIndex:2000, boxShadow:"0 4px 20px rgba(0,0,0,0.5)" },
  toastErr:  { background:"#da3633" },
};

export default function App() {
  const [tenants, setTenants]       = useState(loadTenants);
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(BLANK);
  const [search, setSearch]         = useState("");
  const [dismissed, setDismissed]   = useState([]);
  const [toast, setToast]           = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  function save_storage(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
  }

  function showToast(msg, err=false) {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3000);
  }

  const rows = useMemo(() => tenants.map(t => {
    const months   = Number(t.monthsPaid) || 0;
    const amount   = months * MONTHLY_RATE;
    const start    = parseDate(t.coverageStart);
    const nextDate = start ? addMonths(start, months) : null;
    const days     = daysLeft(nextDate);
    const paid     = nextDate ? nextDate > TODAY : false;
    const isOver   = !paid && nextDate !== null;
    const balance  = isOver ? amount : 0;
    return { ...t, amount, nextDate, daysLeft: days, paid, isOverdue: isOver, balance };
  }), [tenants]);

  const alerts         = rows.filter(r => r.isOverdue && !dismissed.includes(r.id));
  const totalCollected = rows.reduce((s,r) => s + (r.paid ? r.amount : 0), 0);
  const totalBalance   = rows.reduce((s,r) => s + r.balance, 0);
  const overdueCount   = rows.filter(r => r.isOverdue).length;

  const visible = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r => r.name.toLowerCase().includes(s) || r.shopNo.includes(s) || r.phone.includes(s));
  }, [rows, search]);

  function openAdd() { setForm(BLANK); setEditId(null); setShowForm(true); }
  function openEdit(t) {
    setForm({ shopNo:t.shopNo, name:t.name, phone:t.phone, monthsPaid:t.monthsPaid,
      datePaid:t.datePaid, coverageStart:t.coverageStart, account:t.account });
    setEditId(t.id); setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditId(null); }

  function saveForm() {
    if (!form.shopNo.trim()) return showToast("Shop No. is required.", true);
    if (!form.monthsPaid || isNaN(Number(form.monthsPaid)) || Number(form.monthsPaid) <= 0)
      return showToast("Enter how many months were paid.", true);
    if (!form.coverageStart) return showToast("Coverage start date is required.", true);
    let updated;
    if (editId !== null) {
      updated = tenants.map(t => t.id===editId ? { ...t, ...form, monthsPaid:Number(form.monthsPaid) } : t);
      showToast("Tenant updated!");
    } else {
      updated = [...tenants, { id:genId(), ...form, monthsPaid:Number(form.monthsPaid) }];
      showToast("Tenant added!");
    }
    setTenants(updated);
    save_storage(updated);
    closeForm();
  }

  function deleteTenant(id) {
    const updated = tenants.filter(t => t.id!==id);
    setTenants(updated); save_storage(updated);
    setConfirmDel(null); showToast("Tenant removed.");
  }

  function exportCSV() {
    const cols = ["Shop No","Tenant Name","Phone","Months Paid","Amount (TSh)","Date Paid","Coverage Start","Coverage Ends","Status","Balance (TSh)","Account"];
    const data = rows.map(r => [r.shopNo, r.name, r.phone, r.monthsPaid, r.amount, r.datePaid,
      r.coverageStart, r.nextDate?formatDate(r.nextDate):"",
      r.paid?"PAID":r.isOverdue?"OVERDUE":"—", r.balance, r.account]);
    data.push(["","","","","","","","","TOTAL BALANCE", totalBalance,""]);
    const csv = [cols,...data].map(r=>r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = "rental-payment-record.csv"; a.click();
    showToast("Exported to CSV!");
  }

  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.title}>🏪 RENTAL SHOPS PAYMENT RECORD</div>
          <div style={S.sub}>Today: {formatDate(TODAY)} &nbsp;|&nbsp; {tenants.length} Tenants &nbsp;|&nbsp; George Singu</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button style={S.btnGreen} onClick={openAdd}>+ Add Tenant</button>
          <button style={S.btnSec}   onClick={exportCSV}>⬇ Export CSV</button>
        </div>
      </div>

      <div style={S.body}>

        {/* Overdue Alerts */}
        {alerts.length > 0 && (
          <div style={S.alertBox}>
            <div style={S.alertHead}>
              <span>🔔 OVERDUE RENT ALERT — {alerts.length} tenant{alerts.length>1?"s":""} past due!</span>
              <button onClick={()=>setDismissed(prev=>[...prev,...alerts.map(a=>a.id)])}
                style={{background:"none",border:"1px solid #0d1117",color:"#0d1117",borderRadius:4,padding:"2px 10px",cursor:"pointer",fontSize:11,fontWeight:700}}>
                Dismiss All
              </button>
            </div>
            {alerts.map(a => (
              <div key={a.id} style={S.alertItem}>
                <div>
                  <div style={S.alertName}>Shop #{a.shopNo} — {a.name || "(No name)"}</div>
                  <div style={S.alertInfo}>
                    Paid {a.monthsPaid} month{a.monthsPaid!==1?"s":""} × TSh 200,000 = {fmt(a.amount)} &nbsp;|&nbsp;
                    Coverage ended: {a.nextDate ? formatDate(a.nextDate) : "—"} &nbsp;|&nbsp;
                    <strong style={{color:"#f85149"}}>{Math.abs(a.daysLeft)} day{Math.abs(a.daysLeft)!==1?"s":""} overdue</strong>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <button style={{...S.btnSmall,color:"#3fb950"}} onClick={()=>openEdit(a)}>📝 Update Payment</button>
                  <button style={S.btnSmall} onClick={()=>setDismissed(prev=>[...prev,a.id])}>Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={S.statsRow}>
          <div style={S.statCard}>
            <div style={S.statLabel}>TOTAL TENANTS</div>
            <div style={S.statVal}>{tenants.length}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>TOTAL COLLECTED</div>
            <div style={{...S.statVal,color:"#3fb950",fontSize:16}}>{fmt(totalCollected)}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>TOTAL BALANCE OWED</div>
            <div style={{...S.statVal,color:"#f85149",fontSize:16}}>{fmt(totalBalance)}</div>
          </div>
          <div style={{...S.statCard,border:overdueCount>0?"1px solid #f0883e":"1px solid #30363d"}}>
            <div style={S.statLabel}>OVERDUE</div>
            <div style={{...S.statVal,color:overdueCount>0?"#f0883e":"#3fb950"}}>{overdueCount}</div>
            <div style={S.statSub}>{overdueCount>0?"⚠ Action needed":"✓ All clear"}</div>
          </div>
        </div>

        {/* Search */}
        <div style={S.toolbar}>
          <input style={{...S.input,minWidth:220}} placeholder="🔍 Search by name, shop no, phone..."
            value={search} onChange={e=>setSearch(e.target.value)} />
          {search && <button style={S.btnSec} onClick={()=>setSearch("")}>Clear</button>}
        </div>

        {/* Table */}
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>SHOP NO.</th>
                <th style={S.th}>TENANT NAME</th>
                <th style={S.th}>PHONE NO.</th>
                <th style={S.thC}>MONTHS<br/>PAID</th>
                <th style={S.thR}>AMOUNT (TSh)</th>
                <th style={S.th}>DATE PAID</th>
                <th style={S.th}>COVERAGE START</th>
                <th style={S.thC}>STATUS</th>
                <th style={S.th}>COVERAGE ENDS</th>
                <th style={S.thR}>BALANCE (TSh)</th>
                <th style={S.th}>ACCOUNT</th>
                <th style={S.th}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(r => (
                <tr key={r.id} style={{background: r.isOverdue?"#1a0800":r.paid?"#0a1a0a":"#0d1117"}}>
                  <td style={S.td}><strong style={{color:"#f0883e"}}>{r.shopNo}</strong></td>
                  <td style={S.td}>{r.name || <span style={{color:"#484f58"}}>—</span>}</td>
                  <td style={S.td}>{r.phone || <span style={{color:"#484f58"}}>—</span>}</td>
                  <td style={S.tdC}><strong style={{color:"#58a6ff"}}>{r.monthsPaid}</strong><span style={{fontSize:10,color:"#8b949e"}}> mo</span></td>
                  <td style={S.tdR}>
                    {fmt(r.amount)}
                    <div style={{fontSize:10,color:"#8b949e"}}>{r.monthsPaid} × 200,000</div>
                  </td>
                  <td style={S.td}>{r.datePaid || "—"}</td>
                  <td style={S.td}>{r.coverageStart || "—"}</td>
                  <td style={S.tdC}>
                    <span style={r.isOverdue?S.overBadge:r.paid?S.paidBadge:S.nopayBadge}>
                      {r.isOverdue?"OVERDUE":r.paid?"PAID":"—"}
                    </span>
                  </td>
                  <td style={S.td}>
                    {r.nextDate ? (
                      <span style={{color:r.isOverdue?"#f0883e":r.daysLeft<=60?"#e3b341":"#e6edf3"}}>
                        {formatDate(r.nextDate)}
                        <span style={{fontSize:10,marginLeft:6,color:"#8b949e"}}>
                          {r.isOverdue ? `(${Math.abs(r.daysLeft)}d over)` : r.daysLeft<=60 ? `(in ${r.daysLeft}d)` : ""}
                        </span>
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{...S.tdR,color:r.balance>0?"#f85149":"#3fb950",fontWeight:r.balance>0?700:400}}>
                    {r.balance>0 ? fmt(r.balance) : "TSh 0"}
                  </td>
                  <td style={{...S.td,fontSize:11,color:"#8b949e"}}>{r.account||"—"}</td>
                  <td style={S.td}>
                    <div style={{display:"flex",gap:5}}>
                      <button style={S.btnSmall} onClick={()=>openEdit(r)}>Edit</button>
                      <button style={{...S.btnSmall,color:"#f85149"}} onClick={()=>setConfirmDel(r.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              <tr style={S.totalRow}>
                <td colSpan={9} style={{...S.td,textAlign:"right",color:"#8b949e",fontSize:11,letterSpacing:1}}>TOTAL BALANCE OWED</td>
                <td style={{...S.tdR,color:"#f85149"}}>{fmt(totalBalance)}</td>
                <td colSpan={2} style={S.td}></td>
              </tr>
            </tbody>
          </table>
          {visible.length===0 && <div style={{textAlign:"center",padding:40,color:"#484f58"}}>No tenants found.</div>}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&closeForm()}>
          <div style={S.modal}>
            <div style={S.modalTitle}>{editId!==null?"✏️ EDIT TENANT":"➕ ADD NEW TENANT"}</div>
            <div style={S.fRow2}>
              <div style={S.fRow}>
                <label style={S.label}>SHOP NO. *</label>
                <input style={S.fInput} value={form.shopNo} onChange={e=>setForm(f=>({...f,shopNo:e.target.value}))} placeholder="e.g. 6" />
              </div>
              <div style={S.fRow}>
                <label style={S.label}>PHONE NO.</label>
                <input style={S.fInput} value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+255..." />
              </div>
            </div>
            <div style={S.fRow}>
              <label style={S.label}>TENANT NAME</label>
              <input style={S.fInput} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full name" />
            </div>
            <div style={{...S.fRow,background:"#0d1a2a",border:"1px solid #1f3a5a",borderRadius:6,padding:"12px 14px"}}>
              <div style={{fontSize:11,color:"#58a6ff",marginBottom:8,fontWeight:700}}>💰 PAYMENT — Rate: TSh 200,000/month</div>
              <div style={S.fRow2}>
                <div>
                  <label style={S.label}>MONTHS PAID *</label>
                  <input style={S.fInput} type="number" min="1" value={form.monthsPaid}
                    onChange={e=>setForm(f=>({...f,monthsPaid:e.target.value}))} placeholder="e.g. 4" />
                </div>
                <div style={{display:"flex",alignItems:"flex-end"}}>
                  <div style={{background:"#161b22",border:"1px solid #30363d",borderRadius:6,padding:"8px 12px",fontSize:13,color:"#3fb950",fontWeight:700,width:"100%"}}>
                    = TSh {form.monthsPaid ? (Number(form.monthsPaid)*200000).toLocaleString() : "0"}
                  </div>
                </div>
              </div>
            </div>
            <div style={{height:12}}/>
            <div style={S.fRow2}>
              <div style={S.fRow}>
                <label style={S.label}>DATE PAID (dd/mm/yyyy)</label>
                <input style={S.fInput} value={form.datePaid} onChange={e=>setForm(f=>({...f,datePaid:e.target.value}))} placeholder="14/02/2026" />
              </div>
              <div style={S.fRow}>
                <label style={S.label}>COVERAGE START (dd/mm/yyyy) *</label>
                <input style={S.fInput} value={form.coverageStart} onChange={e=>setForm(f=>({...f,coverageStart:e.target.value}))} placeholder="01/01/2026" />
              </div>
            </div>
            {form.monthsPaid && form.coverageStart && parseDate(form.coverageStart) && (
              <div style={{background:"#0a1a0a",border:"1px solid #238636",borderRadius:6,padding:"10px 14px",marginBottom:13,fontSize:12,color:"#3fb950"}}>
                ✅ Coverage: <strong>{form.coverageStart}</strong> → <strong>{formatDate(addMonths(parseDate(form.coverageStart), Number(form.monthsPaid)))}</strong>
                <br/><span style={{color:"#8b949e"}}>Status switches to OVERDUE automatically after this date.</span>
              </div>
            )}
            <div style={S.fRow}>
              <label style={S.label}>ACCOUNT</label>
              <input style={S.fInput} value={form.account} onChange={e=>setForm(f=>({...f,account:e.target.value}))} placeholder="Account number" />
            </div>
            <div style={{display:"flex",gap:10,marginTop:10}}>
              <button style={S.btnPrim} onClick={saveForm}>💾 Save Tenant</button>
              <button style={S.btnSec}  onClick={closeForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDel && (
        <div style={S.overlay}>
          <div style={{...S.modal,maxWidth:340,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
            <div style={{fontWeight:700,fontSize:15,marginBottom:8,color:"#f85149"}}>Delete this tenant?</div>
            <div style={{color:"#8b949e",fontSize:13,marginBottom:24}}>This cannot be undone.</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button style={{...S.btnPrim,background:"#da3633"}} onClick={()=>deleteTenant(confirmDel)}>Yes, Delete</button>
              <button style={S.btnSec} onClick={()=>setConfirmDel(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{...S.toast,...(toast.err?S.toastErr:{})}}>{toast.msg}</div>}
    </div>
  );
}
