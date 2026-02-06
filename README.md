# 0ne L1fe — Clan Website

Official website of the 0ne L1fe clan for the game Standoff 2.

The website presents the clan and its leadership and is used to collect player applications.
All applications submitted through the site are delivered directly to clan administrators via Telegram.

## Overview

The project is a static landing page designed for clan presentation and recruitment.
It is fully responsive and works correctly on desktop and mobile devices.

Applications are submitted through a form on the website and processed by a Cloudflare Worker,
which forwards the data to Telegram.

## Configuration

Form submission settings, seasons, and ranks are configured via a JSON configuration file.
The application endpoint points to a Cloudflare Worker responsible for secure data delivery.

Sensitive data such as Telegram bot tokens, chat IDs, and security secrets are not stored in the repository
and are managed through Cloudflare environment variables.

## Privacy

User data submitted via the application form is used exclusively for clan recruitment purposes.
A detailed privacy policy is available on the website.

## License

Source code is licensed under the MIT License.

All brand elements, including the clan name, logos, images, and textual content,
are proprietary and may not be copied or reused without explicit permission.

© 2026 0ne L1fe. All rights reserved.