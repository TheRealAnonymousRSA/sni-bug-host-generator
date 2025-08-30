import { useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [limit, setLimit] = useState(10);
  const [minMB, setMinMB] = useState(1);
  const [output, setOutput] = useState("Ready to hunt SNI Bug Hosts...");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setOutput("Hunting for SNI Bug Hosts...\n");
    try {
      const res = await fetch(`/api/sni-hosts?limit=${limit}&minMB=${minMB}`);
      const data = await res.json();
      if (data.hosts.length === 0) {
        setOutput("No working hosts found.");
      } else {
        let text = "=== SNI BUG HOSTS ===\n";
        data.hosts.forEach(h => {
          text += `Host: ${h.host}\nLatency: ${h.latency}ms\nBandwidth: ${h.bandwidth}\nZero-Rated: ${h.zeroRated ? "YES ✅" : "NO ❌"}\n\n`;
        });
        setOutput(text);
      }
    } catch (err) {
      setOutput("Error fetching hosts: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>SNI Bug Host Hunter</h1>
        <input
          type="number"
          className={styles.input}
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="Number of hosts (limit)"
        />
        <input
          type="number"
          className={styles.input}
          value={minMB}
          onChange={(e) => setMinMB(e.target.value)}
          placeholder="Min MB to test speed"
        />
        <button className={styles.button} onClick={handleGenerate} disabled={loading}>
          {loading ? "Scanning..." : "Generate Hosts"}
        </button>
        <div className={styles.output}>{output}</div>
      </main>

      <footer className={styles.footer}>
        <span>
          Developed by <b>TheRealAnonymousRSA</b><br />
          Member of the <b>TARAGON SQUAD 🇻🇦</b><br />
          <b>TRS Never Walk Alone 🇻🇦</b><br />
          For educational/research use only • <b>Stay anonymous.</b>
        </span>
      </footer>
    </div>
  );
}
