import { useState, useEffect } from "react";

const PARCEIROS = [
  { id: "5814e928-5efc-46af-a581-8d416b886495", nome: "Vettrus" },
  { id: "0480e6db-cf90-4dfe-b59c-0e91f9da9f64", nome: "Olist" },
  { id: "87995291-fc83-4809-a833-2582e0073314", nome: "Base" },
  { id: "6fd1c874-0f2b-4de7-afe6-1511ded1dc7a", nome: "GE Finance" },
  { id: "49daeacf-9f66-4c36-ab2f-0d5e46041e67", nome: "Joom Pulse" },
  { id: "5f318014-9a2c-4ab9-afa7-fff7c1217bb4", nome: "NuvemShop" },
  { id: "0cea8e52-cb8a-4789-9a0f-a54bec5cca96", nome: "GoBots" },
  { id: "29a19595-3683-45e3-9a09-ed0c311a59a6", nome: "Avantpro" },
  { id: "9c4b3b4d-3287-4365-bfff-ae092b50b5f6", nome: "Radar Scout" },
  { id: "80cfb973-2626-406c-9095-d044ca365af1", nome: "Adman" },
  { id: "9c61734a-3958-4d94-b4d6-d6c6996999e7", nome: "EWZ BTG Pactual" },
  { id: "52ae04f8-7dac-4ddd-a431-8a3e8ff43209", nome: "Smart Online" },
];

const LIST_ID = "901303465036";
const FIELD_ID = "61b17f68-c78f-489f-b9f7-41fc5b67ce43";

function Formulario({ taskId, taskName }: { taskId: string; taskName: string }) {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const toggle = (id: string) =>
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const enviar = async () => {
    if (selecionados.length === 0) {
      setErro("Selecione ao menos um parceiro.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Você é um agente que atualiza campos no ClickUp via API.
Quando receber um taskId, fieldId e valor, confirme apenas com JSON: {"ok": true}.
Não escreva nada além disso.`,
          messages: [
            {
              role: "user",
              content: `Registre que o cliente com taskId="${taskId}" selecionou os seguintes parceiros (IDs de labels): ${JSON.stringify(selecionados)}.
Campo ClickUp: fieldId="${FIELD_ID}".
Confirme com {"ok": true}.`,
            },
          ],
          mcp_servers: [
            { type: "url", url: "https://mcp.clickup.com/mcp", name: "clickup" },
          ],
        }),
      });
      const data = await res.json();
      const txt = data.content?.map((b: any) => b.text || "").join("") || "";
      if (txt.includes("ok") || res.ok) {
        setEnviado(true);
      } else {
        setErro("Erro ao salvar. Tente novamente.");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    }
    setEnviando(false);
  };

  if (enviado)
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
          <h2 style={{ color: "#1a1a2e", marginBottom: 8 }}>Obrigado!</h2>
          <p style={{ color: "#555", textAlign: "center" }}>
            Suas informações foram salvas com sucesso.
            <br />
            Nossa equipe entrará em contato em breve.
          </p>
        </div>
      </div>
    );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img
          src="https://pages.greatpages.com.br/www.ecommercepuro.com.br/1776877996/imagens/desktop/14938-5a19bd7255a4a0c17fc1ff87fa8ee9a2.png"
          alt="Ecommerce Puro"
          style={{ height: 52, objectFit: "contain", marginBottom: 20 }}
        />
        <h2 style={{ color: "#1a1a2e", marginBottom: 4, textAlign: "center" }}>
          Pesquisa de Parceiros
        </h2>
        {taskName && (
          <p style={{ color: "#888", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
            Olá, <strong>{taskName}</strong>! 👋
          </p>
        )}
        <p style={{ color: "#444", fontSize: 14, marginBottom: 20, textAlign: "center", lineHeight: 1.6 }}>
          Quais das soluções abaixo você já utiliza no seu negócio?
          <br />
          <span style={{ fontSize: 12, color: "#888" }}>Selecione todas que se aplicam.</span>
        </p>

        <div style={styles.grid}>
          {PARCEIROS.map((p) => {
            const sel = selecionados.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                style={{ ...styles.chip, ...(sel ? styles.chipSel : {}) }}
              >
                {sel ? "✓ " : ""}
                {p.nome}
              </button>
            );
          })}
        </div>

        {erro && <p style={{ color: "#e74c3c", fontSize: 13, marginTop: 8 }}>{erro}</p>}

        <button
          onClick={enviar}
          disabled={enviando}
          style={{ ...styles.btn, marginTop: 24, opacity: enviando ? 0.7 : 1 }}
        >
          {enviando ? "Enviando..." : "Enviar resposta →"}
        </button>

        <p style={{ fontSize: 11, color: "#aaa", marginTop: 16, textAlign: "center" }}>
          Ecommerce Puro · Seus dados são confidenciais
        </p>
      </div>
    </div>
  );
}

function PainelConsultor() {
  const [clientes, setClientes] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [copiado, setCopiado] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";

  const buscarClientes = async (cur: string | null = null) => {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Você busca tarefas no ClickUp e retorna SOMENTE JSON válido, sem markdown, sem texto extra.
Formato: {"tasks": [{"id": "...", "name": "..."}], "last_id": "cursor_ou_null", "total": numero}`,
          messages: [
            {
              role: "user",
              content: `Busque as primeiras 50 tarefas da list_id="${LIST_ID}" no ClickUp${cur ? `, a partir do cursor "${cur}"` : ""}.
Retorne SOMENTE JSON no formato especificado.`,
            },
          ],
          mcp_servers: [
            { type: "url", url: "https://mcp.clickup.com/mcp", name: "clickup" },
          ],
        }),
      });
      const data = await res.json();
      const txt = data.content?.filter((b: any) => b.type === "text").map((b: any) => b.text).join("") || "{}";
      const clean = txt.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setClientes((prev) => (cur ? [...prev, ...(parsed.tasks || [])] : parsed.tasks || []));
      setCursor(parsed.last_id || null);
    } catch {
      setErro("Erro ao buscar clientes. Verifique a conexão com o ClickUp.");
    }
    setLoading(false);
  };

  const copiarLink = (id: string, nome: string) => {
    const link = `${baseUrl}?cliente=${id}&nome=${encodeURIComponent(nome)}`;
    navigator.clipboard.writeText(link);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const exportarCSV = () => {
    const rows = [["Nome do Cliente", "Link da Pesquisa"]];
    clientes.forEach((c) => {
      const link = `${baseUrl}?cliente=${c.id}&nome=${encodeURIComponent(c.name)}`;
      rows.push([c.name, link]);
    });
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "links-parceiros.csv";
    a.click();
  };

  const filtrados = clientes.filter((c) =>
    c.name?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: 700 }}>
        <h2 style={{ color: "#1a1a2e", marginBottom: 4 }}>🔗 Gerador de Links</h2>
        <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>
          Gere links únicos para cada cliente e envie no WhatsApp.
        </p>

        {!clientes.length && !loading && (
          <button onClick={() => buscarClientes()} style={styles.btn}>
            Buscar clientes do ClickUp
          </button>
        )}

        {loading && (
          <div style={{ textAlign: "center", color: "#666", padding: 20 }}>
            ⏳ Buscando clientes...
          </div>
        )}

        {erro && <p style={{ color: "#e74c3c", fontSize: 13 }}>{erro}</p>}

        {clientes.length > 0 && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <input
                placeholder="🔍 Buscar cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={styles.input}
              />
              <button
                onClick={exportarCSV}
                style={{ ...styles.btn, background: "#27ae60", fontSize: 13, padding: "8px 14px" }}
              >
                ⬇ Exportar CSV
              </button>
              {cursor && (
                <button
                  onClick={() => buscarClientes(cursor)}
                  disabled={loading}
                  style={{ ...styles.btn, background: "#8e44ad", fontSize: 13, padding: "8px 14px" }}
                >
                  Carregar mais
                </button>
              )}
            </div>

            <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
              {filtrados.length} cliente(s) exibido(s) de {clientes.length} carregados
            </p>

            <div style={{ maxHeight: 380, overflowY: "auto", borderRadius: 8, border: "1px solid #eee" }}>
              {filtrados.map((c, i) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: i % 2 === 0 ? "#fafafa" : "#fff",
                    borderBottom: "1px solid #f0f0f0",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "#333",
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.name}
                  </span>
                  <button
                    onClick={() => copiarLink(c.id, c.name)}
                    style={{
                      background: copiado === c.id ? "#27ae60" : "#3498db",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 12px",
                      fontSize: 12,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {copiado === c.id ? "✓ Copiado!" : "Copiar link"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("loading");
  const [taskId, setTaskId] = useState("");
  const [taskName, setTaskName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("cliente");
    const nome = params.get("nome") || "";
    if (cid) {
      setTaskId(cid);
      setTaskName(decodeURIComponent(nome));
      setView("form");
    } else {
      setView("painel");
    }
  }, []);

  if (view === "loading") return <div style={styles.page}><p>Carregando...</p></div>;
  if (view === "form") return <Formulario taskId={taskId} taskName={taskName} />;
  return <PainelConsultor />;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "1px solid #eee",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    width: "100%",
  },
  chip: {
    padding: "10px 8px",
    borderRadius: 8,
    border: "2px solid #e0e0e0",
    background: "#fafafa",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    color: "#444",
    transition: "all 0.15s",
    textAlign: "center",
  },
  chipSel: {
    background: "#e8f4fd",
    borderColor: "#3498db",
    color: "#2980b9",
  },
  btn: {
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 24px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 13,
    minWidth: 0,
  },
};
