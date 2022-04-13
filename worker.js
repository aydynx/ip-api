addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request).catch((err) => new Response(err.stack, { status: 500 })));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const { pathname } = url;
  const params = new URLSearchParams(url.search);

  const format = params.get("format");
  const ip = request.headers.get("CF-Connecting-IP");

  if (!ip || !ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
    return new Response("invalid ip", { status: 500 });
  }

  const data = {
    ip: ip,
    asn: request.cf.asn,
    as: request.cf.asOrganization,
    continent: request.cf.continent,
    country: request.cf.country,
    region: request.cf.region,
    regionCode: request.cf.regionCode,
    city: request.cf.city,
    zip: request.cf.postalCode,
    longitude: request.cf.longitude,
    latitude: request.cf.latitude,
    timezone: request.cf.timezone,
    server: request.cf.colo,
  };

  if (pathname.startsWith("/full")) {
    if (format === "text") {
      return new Response(
        Object.keys(data)
          .map((key) => `${data[key]}`)
          .join("\n"),
        { status: 200, headers: { "Content-Type": "text/plain" } }
      );
    } else if (format === "json") {
      return new Response(JSON.stringify(data, null, 2), { status: 200, headers: { "Content-Type": "application/json" } });
    } else if (format === "csv") {
      return new Response(
        Object.keys(data)
          .map((key) => `"${key}","${data[key]}"`)
          .join("\n"),
        { status: 200, headers: { "Content-Type": "text/csv" } }
      );
    } else if (format === "xml") {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
              <ip>
                ${Object.keys(data)
                  .map((key) => `<${key}>${data[key]}</${key}>`)
                  .join("\n")}
              </ip>`,
        { status: 200, headers: { "Content-Type": "application/xml" } }
      );
    } else if (format === "html") {
      return new Response(
        `<!DOCTYPE html>
                  <html>
                      <head>
                          <title>IP Lookup</title>
                      </head>
                      <body>
                          <h1>IP Lookup</h1>
                          <table>
                              <tr>
                                  <th>IP</th>
                                  <td>${data.ip}</td>
                              </tr>
                              <tr>
                                  <th>ASN</th>
                                  <td>${data.asn}</td>
                              </tr>
                              <tr>
                                  <th>AS</th>
                                  <td>${data.as}</td>
                              </tr>
                              <tr>
                                  <th>Continent</th>
                                  <td>${data.continent}</td>
                              </tr>
                              <tr>
                                  <th>Country</th>
                                  <td>${data.country}</td>
                              </tr>
                              <tr>
                                  <th>Region</th>
                                  <td>${data.region}</td>
                              </tr>
                              <tr>
                                  <th>Region Code</th>
                                  <td>${data.regionCode}</td>
                              </tr>
                              <tr>
                                  <th>City</th>
                                  <td>${data.city}</td>
                              </tr>
                              <tr>
                                  <th>Zip</th>
                                  <td>${data.zip}</td>
                              </tr>
                              <tr>
                                  <th>Longitude</th>
                                  <td>${data.longitude}</td>
                              </tr>
                              <tr>
                                  <th>Latitude</th>
                                  <td>${data.latitude}</td>
                              </tr>
                              <tr>
                                  <th>Timezone</th>
                                  <td>${data.timezone}</td>
                              </tr>
                              <tr>
                                  <th>Server</th>
                                  <td>${data.server}</td>
                              </tr>
                          </table>
                      </body>
                  </html>`,
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    } else if (format === "md") {
      return new Response(
        `# IP Lookup
            **IP:** ${data.ip}
            **ASN:** ${data.asn}
            **AS:** ${data.as}
            **Continent:** ${data.continent}
            **Country:** ${data.country}
            **Region:** ${data.region}
            **Region Code:** ${data.regionCode}
            **City:** ${data.city}
            **Zip:** ${data.zip}
            **Longitude:** ${data.longitude}
            **Latitude:** ${data.latitude}
            **Timezone:** ${data.timezone}
            **Server:** ${data.server}`,
        { status: 200, headers: { "Content-Type": "text/markdown" } }
      );
    }
  } else if (pathname.startsWith("/raw")) {
    return new Response(JSON.stringify(request.cf, null, 2), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (format === "json") {
    return new Response(JSON.stringify({ ip: ip }), { status: 200 });
  } else if (format === "text") {
    return new Response(ip, { status: 200 });
  }
  return new Response(ip, { status: 200 });
}
