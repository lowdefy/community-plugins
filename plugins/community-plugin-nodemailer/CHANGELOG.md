# @lowdefy/community-plugin-nodemailer

## 1.2.0

### Minor Changes

- 6527ee9: Update nodemailer from 6.9.7 to 10.1.7. This fixes address-parser denial-of-service bugs (GHSA-2x7j-588g-ccc2, GHSA-v53p-9fqp-m79j, GHSA-rcmh-qjqh-p98v) that could be triggered through the sign-in email field, along with other nodemailer advisories. nodemailer 10 requires Node.js 20 or newer.

## 1.1.4

### Patch Changes

- d105485: Fix broken logo height when viewing email in Outlook.

## 1.1.3

### Patch Changes

- 220f9cf: Fix custom templates in EmailProvider.

## 1.1.2

### Patch Changes

- 832d0b6: Fix default email template to display the app host name.
- 40ad8b2: Unpin next-auth dependency.
- a2ead6a: Update dependency nodemailer to v6.9.7.

## 1.1.1

### Patch Changes

- 72d39d5: Do not pin Lowdefy utility dependencies to a fixed version.

## 1.1.0

### Minor Changes

- d1b3bae: Add returnPageId property to EmailProvider.
- d1b3bae: Add support for custom email nunjucks templates.
- d1b3bae: Improve email templates.

## 1.0.3

### Patch Changes

- 728e512: Fix package types import config.

## 1.0.2

### Patch Changes

- f31c3db: Fix plugin configuration files.

## 1.0.1

### Patch Changes

- 0f9bfc3: Update npm publish config
