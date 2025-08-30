import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState } from 'react'

export default function Home() {
  const [limit, setLimit] = useState(10)
  const [bandwidth, setBandwidth] = useState(1)
  const [hosts, setHosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchHosts = async () => {
    setLoading(true)
    setCopied(false)
    setHosts([])
    try {
      const res = await fetch(`/api/sni-hosts?limit=${limit}&minMB=${bandwidth}`)
      const data = await res.json()
      setHosts(data.hosts || [])
    } catch {
      setHosts([])
    }
    setLoading(false)
  }

  const copyToClipboard = () => {
    if (hosts.length === 0) return;
    navigator.clipboard.writeText(hosts.map(h => h.host).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>SNI Bug Host Generator</title>
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>&gt; SNI Bug Host Generator</h1>
        <div className={styles.inputRow}>
          <label>
            <span>Hosts</span>
            <input type="number" min="1" max="50" value={limit}
              onChange={e => setLimit(Number(e.target.value))} className={styles.input} />
          </label>
          <label>
            <span>Min bandwidth (MB)</span>
            <input type="number" min="1" max="10000" value={bandwidth}
              onChange={e => setBandwidth(Number(e.target.value))} className={styles.input} />
          </label>
          <button className={styles.button} onClick={fetchHosts} disabled={loading}>
            Generate
          </button>
          <button className={styles.button} onClick={copyToClipboard} disabled={hosts.length === 0}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className={styles.output}>
          {loading && <span>Testing hosts... Please wait.</span>}
          {!loading && hosts.length > 0 &&
            hosts.map(h => (
              <div key={h.host}>
                <span className={styles.working}>{h.host}</span>
                {h.latency && <span> <span style={{color:'#666'}}>({h.latency}ms)</span></span>}
              </div>
            ))
          }
          {!loading && hosts.length === 0 && <span>No results yet.</span>}
        </div>
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
  )
}