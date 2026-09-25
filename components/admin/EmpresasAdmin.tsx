"use client";

import { useState } from "react";
import { LeadsKanban, type Lead } from "./LeadsKanban";
import { ConveniosManager } from "./ConveniosManager";

type Tab = "leads" | "convenios";

export function EmpresasAdmin() {
  const [tab, setTab] = useState<Tab>("leads");
  const [prefill, setPrefill] = useState<Lead | null>(null);
  const [leadsReload, setLeadsReload] = useState(0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Empresas</h1>
        <div className="inline-flex p-1 rounded-btn bg-white shadow-sm">
          {(["leads", "convenios"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setPrefill(null);
              }}
              className={`text-sm font-semibold px-4 py-1.5 rounded-btn transition-colors ${
                tab === t ? "bg-orange-500 text-white" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t === "leads" ? "Embudo de leads" : "Convenios"}
            </button>
          ))}
        </div>
      </div>

      {tab === "leads" ? (
        <LeadsKanban
          reloadKey={leadsReload}
          onCrearConvenio={(lead) => {
            setPrefill(lead);
            setTab("convenios");
          }}
        />
      ) : (
        <ConveniosManager
          prefill={prefill}
          onCreado={() => {
            setPrefill(null);
            setLeadsReload((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}
