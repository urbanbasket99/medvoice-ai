# MedVoice AI vs Traditional HMS Flyers — Feature Gap Analysis

Comparison against typical OPD/IPD HMS marketing feature lists.

**Legend:** ✅ Available · ⚠️ Partial · ❌ Not available

**Phase 2A status:** Implemented (2026-07-10) — UHID lookup, patient chart, medical certificates, lab results, TPA master, insurance claims, provisional/TPA invoice flags, doctor availability, collection reports.

---

## Executive Summary

| Flyer module | Coverage | Notes |
|--------------|----------|-------|
| Patient Management | ⚠️ ~55% | UHID lookup + chart history (Phase 2A) |
| Doctor Management | ⚠️ ~50% | Availability calendar (Phase 2A) |
| OPD Management | ⚠️ ~60% | OPD→IPD transfer from consultation (Phase 3B) |
| IPD Management | ⚠️ ~60% | Phase 3A+3B: wards, beds, admissions, nursing, OT, MLC, billing |
| Billing Management | ⚠️ ~65% | TPA, claims, provisional, reports (Phase 2A) |
| Pharmacy Management | ⚠️ ~45% | Phase 2B |
| Pathology / Laboratory | ⚠️ ~55% | Result entry + print (Phase 2A) |
| TPA / Insurance | ⚠️ ~45% | TPA master + claim CRUD (Phase 2A) |
| Account Management | ⚠️ ~55% | Phase 4A: COA, GL, vouchers, cash book, AP |

---

## Phase 2A delivered

| Feature | Backend | Frontend |
|---------|---------|----------|
| Returning patient UHID/MRN lookup | `GET /patients/lookup` | Registration lookup card |
| Patient chart | Existing list filters | Patient details live cards |
| Medical certificates | `/certificates` CRUD + print | Certificates module + nav |
| Lab result entry + print | `PATCH .../results`, results print | Lab order form + print |
| TPA master | `/billing/tpas` | `/billing/tpas` |
| Provisional / TPA invoice flags | `is_provisional`, `is_tpa`, `tpa_id` | Invoice form |
| Insurance claim CRUD | Invoice claims endpoints | Invoice details section |
| Doctor availability | `GET/PUT /doctors/{id}/availability` | Doctor details editor |
| Collection reports | `/billing/reports/collections` | `/billing/reports` |

### Apply migration

```bash
cd backend
alembic upgrade head
python -m app.db.seed
```

Re-login as admin after seed for `certificates:*` permissions.

---

## Remaining (later phases)

- **3A (done):** IPD wards, bed board, admissions CRUD, discharge/cancel
- **3B (done):** Nursing notes, OT schedules, MLC cases, OPD→IPD transfer, IPD charge ledger + invoice generation
- **4 (done):** Accounts — chart of accounts, income/expense vouchers, cash book, trial balance, AP

---

## Phase 3A delivered (IPD)

| Feature | Backend | Frontend |
|---------|---------|----------|
| Ward master | `GET/POST/PUT/DELETE /ipd/wards` | `/ipd/wards` |
| Bed board | `GET/POST /ipd/beds`, `GET /ipd/beds/available` | `/ipd/beds` |
| Admissions | `GET/POST/PUT /ipd/admissions` | `/ipd/admissions`, `/ipd/admissions/new` |
| Discharge / cancel | `POST .../discharge`, `POST .../cancel` | Admission details page |

### Apply migration

```bash
cd backend
alembic upgrade head
python -m app.db.seed
```

Re-login as admin after seed for `ipd:*` permissions.

| Screen | URL |
|--------|-----|
| Admissions | `/ipd/admissions` |
| New admission | `/ipd/admissions/new` |
| Wards | `/ipd/wards` |
| Bed board | `/ipd/beds` |

---

## Phase 3B delivered (IPD depth)

| Feature | Backend | Frontend |
|---------|---------|----------|
| Nursing notes | `GET/POST /ipd/admissions/{id}/nursing-notes` | Admission details → Nursing tab |
| OT schedules | `GET/POST /ipd/admissions/{id}/ot-schedules` | Admission details → OT tab |
| MLC cases | `GET/PUT /ipd/admissions/{id}/mlc` | Admission details → MLC tab |
| IPD charges + invoice | `GET/POST .../charges`, `POST .../generate-invoice` | Admission details → Billing tab |
| OPD→IPD transfer | `POST /ipd/admissions/from-consultation` | Consultation details → Admit to IPD |

### Apply migration

```bash
cd backend
alembic upgrade head
```

---

## Phase 4A delivered (Accounts)

| Feature | Backend | Frontend |
|---------|---------|----------|
| Chart of accounts | `GET/POST/PUT /accounts/chart` | `/accounts/chart` |
| Expense vouchers | `GET/POST /accounts/expenses` | `/accounts/vouchers` |
| Income vouchers | `GET/POST /accounts/income` | `/accounts/vouchers` |
| Cash book | `GET /accounts/cash-book` | `/accounts/cash-book` |
| Trial balance (GL) | `GET /accounts/trial-balance` | `/accounts/trial-balance` |
| Accounts payable | `GET/POST /accounts/vendors`, vendor-bills, vendor-payments | `/accounts/ap` |

### Apply migration + seed

```bash
cd backend
alembic upgrade head
python -m app.db.seed
```

Re-login as admin for `accounts:*` permissions. Default COA (Cash, Bank, AP, Revenue, Expenses) is seeded automatically.

| Screen | URL |
|--------|-----|
| Chart of accounts | `/accounts/chart` |
| Income & expense | `/accounts/vouchers` |
| Cash book | `/accounts/cash-book` |
| Trial balance | `/accounts/trial-balance` |
| Accounts payable | `/accounts/ap` |

---

*Last updated: Phase 4A complete (accounts/GL, vouchers, cash book, AP). Phase 3B complete. Phase 3A complete. Phase 2B complete.*
