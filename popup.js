const API_KEY = "9acf492a46msh6a0c70309e926e1p109b8ajsn2ee7d3c687be";
const WHOISFREAKS_KEY = "bf1e3e672ab845568d6226302944fef6";
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  try {
    const url = new URL(tabs[0].url);
    const domain = url.hostname;
    document.getElementById("domainInput").value = domain;
    document.getElementById("lookupBtn").click();
  } catch (e) {
    console.warn("Invalid tab URL:", e);
  }
});

document.getElementById("lookupBtn").addEventListener("click", async () => {
  const domain = document.getElementById("domainInput").value.trim();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!domain) {
    alert("Please enter a domain.");
    return;
  }

  resultsDiv.innerHTML = `<p>Loading...</p>`;

  try {
    const whoisResponse = await fetchWhois(domain);
    const whois = whoisResponse || {};
    const dnsData = await fetchDNS(domain);
    const sslData = await fetchSSL(domain);

    const ipRecord = dnsData?.dnsRecords?.find(r => r.dnsType === "A");
    const resolvedIP = ipRecord?.address || null;

    const ipData = resolvedIP ? await fetchIPInfo(resolvedIP) : {};
    const vulns = resolvedIP ? await fetchVulns(resolvedIP) : { vulnerabilities: [] };

    resultsDiv.innerHTML = "";

    renderCard("WHOIS Info", {
      Registrar: whois?.domain_registrar?.registrar_name || "N/A",
      Organization: whois?.registrant_contact?.company || "N/A",
      Country: whois?.registrant_contact?.country_name || "N/A",
      "Creation Date": whois?.create_date || "N/A",
      "Expiration Date": whois?.expiry_date || "N/A"
    });

    renderCard("DNS Info", {
      A_Record: ipRecord?.address || "N/A",
      MX_Records: dnsData.dnsRecords
        .filter(r => r.dnsType === "MX")
        .map(r => `${r.target} (priority ${r.priority})`)
        .join(", ") || "N/A",
      NS_Records: dnsData.dnsRecords
        .filter(r => r.dnsType === "NS")
        .map(r => r.singleName)
        .join(", ") || "N/A",
      SPF: dnsData.dnsRecords
        .find(r => r.dnsType === "SPF")?.strings?.[0] || "N/A",
      TXT: dnsData.dnsRecords
        .filter(r => r.dnsType === "TXT")
        .map(r => r.strings?.join(" "))
        .join(", ") || "N/A"
    });

    renderCard("SSL Certificate Info", {
      Valid: sslData?.valid ? "Yes" : "No",
      Issuer: sslData?.issuer || "N/A",
      "Valid From": sslData?.valid_from || "N/A",
      "Valid To": sslData?.valid_to || "N/A",
      Subject: sslData?.subject || "N/A"
    });

    renderCard("IP Info", {
      IP: resolvedIP || "N/A",
      Organization: ipData.org || "N/A",
      Country: ipData.country || "N/A",
      City: ipData.city || "N/A",
      Timezone: ipData.timezone || "N/A"
    });

    renderCard("Vulnerabilities", vulns.vulnerabilities?.length
      ? Object.fromEntries(vulns.vulnerabilities.map((v, i) => [`Vuln #${i + 1}`, v]))
      : { Status: "No vulnerabilities found." });

  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = `<p>Error retrieving data. Check console for details.</p>`;
  }
});

function renderCard(title, data) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<h3>${title}</h3>` + Object.entries(data).map(
    ([key, value]) => `<p><strong>${key}:</strong> ${value || "N/A"}</p>`
  ).join("");
  document.getElementById("results").appendChild(card);
}

async function fetchWhois(domain) {
  const res = await fetch(`https://api.whoisfreaks.com/v1.0/whois?whois=live&domainName=${domain}&apiKey=${WHOISFREAKS_KEY}`);
  return res.json();
}

async function fetchDNS(domain) {
  const res = await fetch(`https://api.whoisfreaks.com/v2.0/dns/live?apiKey=${WHOISFREAKS_KEY}&domainName=${domain}&type=all`);
  return res.json();
}

async function fetchSSL(domain) {
  const res = await fetch(`https://api.whoisfreaks.com/v1.0/ssl/live?apiKey=${WHOISFREAKS_KEY}&domainName=${domain}&chain=true&sslRaw=true`);
  const data = await res.json();

  if (!data?.sslCertificates?.length) return null;

  const endUserCert = data.sslCertificates.find(cert => cert.chainOrder === "end-user");
  if (!endUserCert) return null;

  return {
    valid: new Date(endUserCert.validityEndDate) > new Date(),
    issuer: endUserCert.issuer?.organization || endUserCert.issuer?.commonName || "N/A",
    valid_from: endUserCert.validityStartDate || "N/A",
    valid_to: endUserCert.validityEndDate || "N/A",
    subject: endUserCert.subject?.commonName || "N/A"
  };
}

async function fetchIPInfo(ip) {
  const res = await fetch(`https://ip-geolocation-ipwhois-io.p.rapidapi.com/json/?ip=${ip}`, {
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": "ip-geolocation-ipwhois-io.p.rapidapi.com"
    }
  });
  return res.json();
}

async function fetchVulns(ip) {
  const res = await fetch(`https://vulnerability-scanner2.p.rapidapi.com/${ip}`, {
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": "vulnerability-scanner2.p.rapidapi.com"
    }
  });
  return res.json();
}
