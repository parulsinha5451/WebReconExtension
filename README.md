Website Recon

Website Recon is a Chrome extension that provides instant reconnaissance on websites. With a single click, you can get WHOIS data, DNS records, IP information, SSL certificate details, and known vulnerabilities for any website—right from your browser.

Features
Fetches WHOIS information: Domain registrar, organization, country, creation, and expiration dates.

Displays DNS records: A, MX, NS, SPF, and TXT records.

Retrieves SSL certificate details: Validity, issuer, subject, and timeframes.

Shows IP address information: Organization, location (country, city), and timezone.

Scans for publicly reported vulnerabilities based on IP.

Works seamlessly on the currently active tab or any manually entered domain.

Installation
Clone or download this repository.

Open chrome://extensions/ in your browser.

Enable "Developer mode".

Click "Load unpacked" and select the repository folder.

Usage
Click the extension icon in your browser.

The extension will auto-populate the domain of the current tab.

Click "Lookup" to fetch the site's recon data.

Results are neatly grouped in cards: WHOIS Info, DNS Info, SSL Certificate Info, IP Info, and Vulnerabilities.

You can also enter a domain manually.

Configuration
This extension uses the following third-party APIs:

WhoisFreaks

ipwhois.io

Vulnerability Scanner RapidAPI

You need valid API keys for:

WHOISFREAKS_KEY

API_KEY (for IP and vulnerability lookups)

Keys should be entered/replaced in popup.js.

File Structure
manifest.json — Chrome extension manifest (v3)

background.js — Service worker for background tasks

popup.html — Extension popup UI

popup.js — Logic to fetch and display recon data
