# TODO

## Fix: registration on admin page

- [ ] Create a concise reproduction path for the bug (what “registration on admin page” means in the UI flow).
- [ ] Verify how the admin dashboard links to registration (AdminDashboard.js).
- [ ] Verify the frontend route for registration and whether it should accept only certain roles.
- [ ] Verify backend auth/register role validation and ensure admin registration is not possible (authController/register).
- [ ] Update frontend routing so the admin page never shows a generic “Register” link that allows creating employer/job-seeker accounts while on admin.
- [ ] Ensure `/admin` unauthorized/unauthenticated states redirect or provide the correct admin login/register guidance.
- [ ] Test manually: visit `/admin` while unauthenticated; confirm CTA behavior.
- [ ] Test: try registering with the CTA; confirm role restrictions behave as expected.

