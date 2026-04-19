# Booking Email Notification Flow (Parent -> Babysitter)

## Does the babysitter get an email when a parent books?
**Yes.**  
When a parent creates a booking request, the backend attempts to send a booking email to the babysitter.

---

## End-to-end workflow

1. **Parent submits booking request (Frontend)**  
   `frontend/src/app/(home)/sitter/[id]/page.tsx`  
   Calls:
   - `POST /bookings` with `babysitterId`, `startTime`, `endTime`

2. **Booking API route receives request (Backend route layer)**  
   `backend/src/app.ts` mounts `/api/bookings`  
   `backend/src/routes/bookingRoutes.ts` maps:
   - `POST /` -> `createBooking`

3. **Booking is validated and created (Controller layer)**  
   `backend/src/controllers/bookingController.ts` -> `createBooking`  
   Main responsibilities:
   - Validates required fields and date range
   - Loads parent and sitter profile
   - Calculates total booking amount
   - Creates booking with status `PENDING`

4. **Babysitter email recipient is resolved (Model layer)**  
   `backend/src/models/bookingModel.ts`  
   Uses:
   - `getSitterUser(sitter.userId)` to fetch sitter user record (including email)

5. **Email content + send action (Service layer)**  
   `backend/src/services/emailService.ts`  
   Uses:
   - `sendBookingRequestEmail(booking, sitterUser)` to build booking email template
   - internal `sendEmail(...)` with Nodemailer transporter (`createTransporter()`)

6. **SMTP delivery configuration (Environment layer)**  
   `backend/.env` (template in `backend/.env.example`)  
   Required env vars:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `FRONTEND_URL` (used in email CTA links)

---

## Important behavior

- If `SMTP_USER` or `SMTP_PASS` is missing, email sending is **skipped** (logged only), and booking creation still succeeds.
- The booking endpoint still returns success to the frontend even if email delivery fails.

---

## Related booking-status email

`backend/src/controllers/bookingController.ts` -> `updateBookingStatus` also triggers an email when status becomes `CONFIRMED` (sent to the parent using the same booking email service function).
