## Goal
Let admins record cash (offline) contributions per project, and have the progress bar include that cash in the "raised" total.

## Changes

### 1. Database
Add a `cash_raised` numeric column (default 0) to `projects`. Existing online donations continue to update `raised` via the current trigger; `cash_raised` is admin-editable only.

### 2. Admin tab (`src/routes/_authenticated/admin.tsx`)
In the Projects editor, add a "Cash raised (UGX)" input next to Budget/Raised. Saving the project writes `cash_raised` to the row.

### 3. Public display (`src/routes/projects.tsx`)
Compute `total = raised + cash_raised` and use it for:
- Progress percentage
- "Raised UGX ..." label in the modal
- "Still needed" calculation

Same change applied anywhere else a project progress bar renders (homepage project section, if present).

## Notes
- Online donations remain automatic through the existing donation → project trigger.
- Cash total is manual and only changes when the admin saves it.
- No change to the donations table or receipts.
