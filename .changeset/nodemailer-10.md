---
'@lowdefy/community-plugin-nodemailer': minor
---

Update nodemailer from 6.9.7 to 10.1.7. This fixes address-parser denial-of-service bugs (GHSA-2x7j-588g-ccc2, GHSA-v53p-9fqp-m79j, GHSA-rcmh-qjqh-p98v) that could be triggered through the sign-in email field, along with other nodemailer advisories. nodemailer 10 requires Node.js 20 or newer.
