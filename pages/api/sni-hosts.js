import https from 'https';

const candidateHosts = [
  "cdn.whatsapp.net",
  "zero.facebook.com",
  "m.facebook.com",
  "v.whatsapp.net",
  "free.facebook.com",
  "internet.org",
  "api.whatsapp.com",
  "cdn.cloudflare.net",
  "www.google.com",
  "www.youtube.com",
  "www.instagram.com",
  "www.tiktok.com",
  "www.reddit.com",
  "discord.com",
  "github.com",
  "gitlab.com"
];

const knownZeroRated = [
  "facebook.com",
  "whatsapp.net",
  "internet.org"
];

function testHost(host, timeoutMs = 3500) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = https.request({
      host,
      servername: host,
      port: 443,
      method: 'HEAD',
      timeout: timeoutMs,
    }, res => {
      const latency = Date.now() - start;
      const zeroRated = knownZeroRated.some(z => host.includes(z));
      resolve({host, status: 'working', latency, zeroRated});
    });
    req.on('error', () => resolve({host, status: 'not working'}));
    req.on('timeout', () => resolve({host, status: 'not working'}));
    req.end();
  });
}

function testBandwidth(host, minMB = 1, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const url = `https://${host}/`;
    const start = Date.now();
    let bytes = 0;
    const req = https.get(url, {timeout: timeoutMs}, res => {
      res.on('data', chunk => {
        bytes += chunk.length;
        if (bytes >= minMB * 1024 * 1024) {
          res.destroy(); // enough data
        }
      });
      res.on('end', () => {
        const duration = (Date.now() - start) / 1000;
        const speed = (bytes / (1024 * 1024)) / duration; // MB/s
        resolve({host, bandwidth: speed});
      });
    });
    req.on('error', () => resolve({host, bandwidth: 0}));
    req.on('timeout', () => resolve({host, bandwidth: 0}));
  });
}

export default async function handler(req, res) {
  const { limit = 10, minMB = 1 } = req.query;
  const count = Math.min(parseInt(limit) || 10, candidateHosts.length);

  const initialResults = await Promise.all(
    candidateHosts.slice(0, count).map(host => testHost(host))
  );

  const workingHosts = initialResults.filter(r => r.status === 'working');

  const finalResults = [];
  for (const h of workingHosts) {
    const bw = await testBandwidth(h.host, minMB);
    if (bw.bandwidth > 0) {
      finalResults.push({...h, bandwidth: bw.bandwidth.toFixed(2) + " MB/s"});
    }
  }

  res.status(200).json({ hosts: finalResults });
}