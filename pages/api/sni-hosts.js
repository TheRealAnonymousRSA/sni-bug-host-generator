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
  "www.netflix.com",
  "www.instagram.com",
  "mail.yahoo.com",
  "www.cloudflare.com",
  "m.twitter.com",
  "www.tiktok.com",
  "api.telegram.org",
  "cdn.discordapp.com",
  "discord.com",
  "github.com",
  "gitlab.com"
];

function testHost(host, timeoutMs = 2500) {
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
      resolve({host, status: 'working', latency});
    });
    req.on('error', () => resolve({host, status: 'not working'}));
    req.on('timeout', () => resolve({host, status: 'not working'}));
    req.end();
  });
}

export default async function handler(req, res) {
  const { limit = 10 } = req.query;
  const count = Math.min(parseInt(limit) || 10, candidateHosts.length);

  const testResults = await Promise.all(
    candidateHosts.slice(0, count).map(host => testHost(host))
  );

  const working = testResults.filter(r => r.status === 'working');
  res.status(200).json({ hosts: working });
}