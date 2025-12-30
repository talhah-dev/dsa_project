# 🏥 Hospital Bed Allocation System (Interval-Based)

A Next.js + TypeScript + MongoDB project that allocates hospital beds to patients using **time intervals** and prevents **overlapping allocations** using an **Interval Tree**.

---

## ✅ What this project does

- Manage **Beds** (add/edit/delete)
- Manage **Patients** (add/edit/search)
- Create **Allocations/Stays** (patient + bed + start/end)
- Prevent **time overlap conflicts** per bed using **Interval Tree**
- Show system overview in **Dashboard**
- Generate **dummy test data** using **Simulation** (peak/long/random scenarios)

---

## 🧾 Core Requirements → Where it is implemented

### 1) Bed inventory management
**Requirement:** Create and manage hospital beds  
**Implemented in:**
- Model: `models/Bed.ts`
- APIs:
  - `app/api/beds/route.ts` (GET, POST)
  - `app/api/beds/[id]/route.ts` (GET, PATCH, DELETE)
- UI:
  - `app/dashboard/beds/page.tsx`

---

### 2) Patient management
**Requirement:** Create and manage patients (no auth required)  
**Implemented in:**
- Model: `models/Patient.ts`
- APIs:
  - `app/api/patients/route.ts` (GET, POST)
  - `app/api/patients/[id]/route.ts` (GET, PATCH)
- UI:
  - `app/dashboard/patients/page.tsx`

---

### 3) Allocation / Stay creation with time interval
**Requirement:** Allocate a bed for a patient from `start` to `end`  
**Implemented in:**
- Model: `models/Stay.ts`
- APIs:
  - `app/api/stays/route.ts` (GET, POST)
  - `app/api/stays/[id]/route.ts` (GET, PATCH)
  - `app/api/allocate/route.ts` (POST) ✅ main allocation logic
- UI:
  - `app/dashboard/allocate/page.tsx`
  - `app/dashboard/allocations/page.tsx`

---

### 4) Overlap prevention using Interval Tree (Core algorithm requirement)
**Requirement:** Efficient overlap detection (not brute force)  
**Implemented in:**
- Interval Tree helper: `lib/intervalTree.ts`
- Used in allocation: `app/api/allocate/route.ts`

---

### 5) Dashboard overview
**Requirement:** Show current system stats + recent allocations  
**Implemented in:**
- UI: `app/dashboard/page.tsx`
- APIs used:
  - `GET /api/beds`
  - `GET /api/stays`

---

### 6) Testing / Demonstration scenarios
**Requirement:** Demonstrate behavior for:
- Peak admissions
- Long stays
- Random arrivals

**Implemented in:**
- API: `app/api/simulate/route.ts`
- UI page: `app/dashboard/simulate/page.tsx`

> `/api/simulate` generates **dummy data** only (not real user flow).

---

## 🌐 Frontend Routes (Pages)

| Page | Route | What it shows |
|---|---|---|
| Dashboard | `/dashboard` | KPIs + recent allocations |
| Beds | `/dashboard/beds` | List beds + Add/Edit/Delete |
| Patients | `/dashboard/patients` | List/search + Add/Edit |
| Allocate | `/dashboard/allocate` | Create allocation via `/api/allocate` |
| Allocations | `/dashboard/allocations` | List all stays with filters |
| Simulate | `/dashboard/simulate` | Generate dummy allocations |

---

## 🔌 Backend API Routes

### Beds
- `GET /api/beds` → list beds
- `POST /api/beds` → create bed
- `GET /api/beds/:id` → get bed
- `PATCH /api/beds/:id` → update bed
- `DELETE /api/beds/:id` → delete bed

### Patients
- `GET /api/patients?q=` → list/search patients
- `POST /api/patients` → create patient
- `GET /api/patients/:id` → get patient
- `PATCH /api/patients/:id` → update patient

### Stays / Allocations
- `GET /api/stays` → list stays (populated bed + patient)
- `POST /api/stays` → create stay (with conflict check)
- `GET /api/stays/:id` → get stay
- `PATCH /api/stays/:id` → update stay (status etc.)

### Allocation (Main)
- `POST /api/allocate` → assigns a free bed using Interval Tree overlap detection

### Simulation (Dummy Data)
- `POST /api/simulate` → generates dummy patients + stays for testing

---

## 🗂️ Folder Structure

```txt
app/
  api/
    beds/
      route.ts
    beds/[id]/
      route.ts
    patients/
      route.ts
    patients/[id]/
      route.ts
    stays/
      route.ts
    stays/[id]/
      route.ts
    allocate/
      route.ts
    simulate/
      route.ts

  dashboard/
    page.tsx
    beds/page.tsx
    patients/page.tsx
    allocate/page.tsx
    allocations/page.tsx
    simulate/page.tsx

lib/
  db.ts
  intervalTree.ts

models/
  Bed.ts
  Patient.ts
  Stay.ts
