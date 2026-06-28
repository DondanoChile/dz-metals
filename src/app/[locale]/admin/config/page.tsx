"use client";

import { useState, useEffect } from "react";

interface CompanyInfo {
  address?: string;
  phone?: string;
  whatsapp?: string;
  email_contact?: string;
  rut?: string;
  google_maps_url?: string;
}

interface SiteStats {
  total_volume_tons?: number;
  countries_count?: number;
  years_experience?: number;
  operations_closed?: number;
}

const inputCls =
  "w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder-gray-600 text-sm";
const labelCls = "block text-sm font-medium text-gray-300 mb-1";

function SaveButton({ loading, saved }: { loading: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="px-6 py-2.5 bg-[#C9A84C] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#b8973b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      {loading ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
    </button>
  );
}

export default function AdminConfigPage() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});
  const [siteStats, setSiteStats] = useState<SiteStats>({});
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [savedCompany, setSavedCompany] = useState(false);
  const [savedStats, setSavedStats] = useState(false);
  const [errorCompany, setErrorCompany] = useState<string | null>(null);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/company-info")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setCompanyInfo(data);
      })
      .catch(() => {});
  }, []);

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCompany(true);
    setErrorCompany(null);
    setSavedCompany(false);

    try {
      const res = await fetch("/api/admin/company-info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyInfo),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorCompany(data.error || "Error al guardar");
      } else {
        setSavedCompany(true);
        setTimeout(() => setSavedCompany(false), 3000);
      }
    } catch {
      setErrorCompany("Error de conexión");
    } finally {
      setLoadingCompany(false);
    }
  };

  const handleStatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStats(true);
    setErrorStats(null);
    setSavedStats(false);

    try {
      const payload: Record<string, number> = {};
      if (siteStats.total_volume_tons !== undefined) payload.total_volume_tons = siteStats.total_volume_tons;
      if (siteStats.countries_count !== undefined) payload.countries_count = siteStats.countries_count;
      if (siteStats.years_experience !== undefined) payload.years_experience = siteStats.years_experience;
      if (siteStats.operations_closed !== undefined) payload.operations_closed = siteStats.operations_closed;

      const res = await fetch("/api/admin/site-stats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorStats(data.error || "Error al guardar");
      } else {
        setSavedStats(true);
        setTimeout(() => setSavedStats(false), 3000);
      }
    } catch {
      setErrorStats("Error de conexión");
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Configuración</h1>
        <p className="text-gray-500 mt-1">Información de la empresa y estadísticas del sitio</p>
      </div>

      {/* Company info */}
      <form onSubmit={handleCompanySubmit} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-semibold text-lg">Información de la Empresa</h2>
        </div>

        <div>
          <label className={labelCls}>Dirección</label>
          <input
            value={companyInfo.address ?? ""}
            onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
            className={inputCls}
            placeholder="Av. Apoquindo 1234, Las Condes, Santiago"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Teléfono</label>
            <input
              value={companyInfo.phone ?? ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
              className={inputCls}
              placeholder="+56 2 2345 6789"
            />
          </div>
          <div>
            <label className={labelCls}>WhatsApp</label>
            <input
              value={companyInfo.whatsapp ?? ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, whatsapp: e.target.value })}
              className={inputCls}
              placeholder="+56 9 1234 5678"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Email de contacto</label>
            <input
              type="email"
              value={companyInfo.email_contact ?? ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, email_contact: e.target.value })}
              className={inputCls}
              placeholder="contacto@dzmetals.cl"
            />
          </div>
          <div>
            <label className={labelCls}>RUT</label>
            <input
              value={companyInfo.rut ?? ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, rut: e.target.value })}
              className={inputCls}
              placeholder="76.123.456-7"
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Google Maps URL</label>
          <input
            type="url"
            value={companyInfo.google_maps_url ?? ""}
            onChange={(e) => setCompanyInfo({ ...companyInfo, google_maps_url: e.target.value })}
            className={inputCls}
            placeholder="https://maps.google.com/..."
          />
        </div>

        {errorCompany && (
          <p className="text-red-400 text-sm">{errorCompany}</p>
        )}

        <div className="flex justify-end pt-2">
          <SaveButton loading={loadingCompany} saved={savedCompany} />
        </div>
      </form>

      {/* Site stats */}
      <form onSubmit={handleStatsSubmit} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 space-y-5">
        <h2 className="text-white font-semibold text-lg mb-2">Estadísticas del Sitio</h2>
        <p className="text-gray-500 text-sm -mt-2">
          Estos valores se muestran en la página principal del sitio.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Volumen total (toneladas)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={siteStats.total_volume_tons ?? ""}
              onChange={(e) => setSiteStats({ ...siteStats, total_volume_tons: parseFloat(e.target.value) || 0 })}
              className={inputCls}
              placeholder="500"
            />
          </div>
          <div>
            <label className={labelCls}>Países de operación</label>
            <input
              type="number"
              min="0"
              value={siteStats.countries_count ?? ""}
              onChange={(e) => setSiteStats({ ...siteStats, countries_count: parseInt(e.target.value) || 0 })}
              className={inputCls}
              placeholder="12"
            />
          </div>
          <div>
            <label className={labelCls}>Años de experiencia</label>
            <input
              type="number"
              min="0"
              value={siteStats.years_experience ?? ""}
              onChange={(e) => setSiteStats({ ...siteStats, years_experience: parseInt(e.target.value) || 0 })}
              className={inputCls}
              placeholder="15"
            />
          </div>
          <div>
            <label className={labelCls}>Operaciones cerradas</label>
            <input
              type="number"
              min="0"
              value={siteStats.operations_closed ?? ""}
              onChange={(e) => setSiteStats({ ...siteStats, operations_closed: parseInt(e.target.value) || 0 })}
              className={inputCls}
              placeholder="300"
            />
          </div>
        </div>

        {errorStats && (
          <p className="text-red-400 text-sm">{errorStats}</p>
        )}

        <div className="flex justify-end pt-2">
          <SaveButton loading={loadingStats} saved={savedStats} />
        </div>
      </form>
    </div>
  );
}
