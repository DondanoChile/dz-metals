"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteUserButton({
  userId,
  userName,
  redirectTo,
}: {
  userId: string;
  userName: string;
  redirectTo: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/delete`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push(redirectTo);
        router.refresh();
      } else {
        const json = await res.json();
        alert("Error al eliminar: " + json.error);
        setConfirming(false);
      }
    } catch {
      alert("Error de conexión");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-red-400 text-sm">¿Eliminar a {userName}?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? "Eliminando..." : "Sí, eliminar"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="px-3 py-1.5 border border-[#2a2a2a] text-gray-400 hover:text-white text-xs font-medium rounded-md transition-colors"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 px-3 py-1.5 border border-red-900/50 text-red-500 hover:bg-red-900/20 hover:border-red-700 text-xs font-medium rounded-md transition-colors"
    >
      <Trash2 size={14} />
      Eliminar usuario
    </button>
  );
}
