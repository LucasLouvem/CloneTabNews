import useSWR from "swr";
import type { ReactNode } from "react";

async function fecthAPI(key) {
  const response = await fetch(key);
  const responseBody = response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <VersionDB />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fecthAPI, {
    refreshInterval: 15000,
  });

  let UpdatedAtText = "Carregando...";

  if (!isLoading && data) {
    UpdatedAtText = new Date(data.updated_at).toLocaleDateString("pt-BR");
  }

  return (
    <div>
      <pre>Última atualização: {UpdatedAtText}</pre>
    </div>
  );
}

function VersionDB() {
  const { isLoading, data } = useSWR("/api/v1/status", fecthAPI, {
    refreshInterval: 15000,
  });

  let databaseStatusInformation: ReactNode = "Carregando...";

  if (!isLoading && data) {
    databaseStatusInformation = (
      <>
        <div>Versão: {data.dependencies.version}</div>
        <div>Conexões Máximas: {data.dependencies.max_connections}</div>
        <div>Conexões abertas: {data.dependencies.opened_connections}</div>
      </>
    );
  }

  return (
    <div>
      <h1>Database</h1>
      <div>{databaseStatusInformation}</div>
    </div>
  );
}
