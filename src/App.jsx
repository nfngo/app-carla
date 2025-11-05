import './App.css'

import { useState, useEffect } from "react";

// Lembra-me — Protótipo de app (single-file React component for preview)
// Tailwind CSS assumed to be available in the environment.
// This component is a self-contained interactive prototype demonstrating
// core screens and interactions: Home / Meds / Reminder / Caregiver Report.

export default function App() {
  const [screen, setScreen] = useState("home");

  // Sample user (José) medications
  const initialMeds = [
    {
      id: 1,
      name: "Atenolol",
      dose: "50 mg",
      times: ["08:00", "20:00"],
      taken: {}, // keyed by date-time string
    },
    {
      id: 2,
      name: "Ácido fólico",
      dose: "5 mg",
      times: ["09:00"],
      taken: {},
    },
    {
      id: 3,
      name: "Metformina",
      dose: "500 mg",
      times: ["08:00", "14:00", "20:00"],
      taken: {},
    },
  ];

  const [meds, setMeds] = useState(initialMeds);
  const [selectedMed, setSelectedMed] = useState(null);
  const [now, setNow] = useState(new Date());
  const [caregiverView, setCaregiverView] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 60);
    return () => clearInterval(t);
  }, []);

  function formatHHMM(d) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  // Simulate AI detection of take: if user presses "Confirm took" we mark as taken
  function confirmTake(medId, time) {
    setMeds((prev) =>
      prev.map((m) => {
        if (m.id !== medId) return m;
        const key = `${new Date().toLocaleDateString()} ${time}`;
        return { ...m, taken: { ...m.taken, [key]: true } };
      })
    );
  }

  function missedCountForToday() {
    const todayKeyPrefix = new Date().toLocaleDateString();
    let missed = 0;
    meds.forEach((m) => {
      m.times.forEach((t) => {
        const key = `${todayKeyPrefix} ${t}`;
        if (!m.taken[key]) missed += 1;
      });
    });
    return missed;
  }

  function adherencePercent() {
    const todayKeyPrefix = new Date().toLocaleDateString();
    let total = 0,
      taken = 0;
    meds.forEach((m) => {
      m.times.forEach((t) => {
        total += 1;
        const key = `${todayKeyPrefix} ${t}`;
        if (m.taken[key]) taken += 1;
      });
    });
    return total === 0 ? 100 : Math.round((taken / total) * 100);
  }

  // Quick components
  const TopBar = () => (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-teal-400 flex items-center justify-center text-white font-bold">LM</div>
        <div>
          <div className="text-sm text-gray-500">Lembra-me</div>
          <div className="text-xs text-gray-400">Uma ferramenta para cuidar</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCaregiverView((s) => !s)}
          className="text-sm px-3 py-1 border rounded-lg hover:cursor-pointer"
        >
          {caregiverView ? "Modo Cuidador" : "Modo José"}
        </button>
        <div className="text-sm text-gray-600">{formatHHMM(now)}</div>
      </div>
    </div>
  );

  const Home = () => (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-2">Bom dia, José 👋</h2>
      <p className="text-gray-600 mb-4">Hoje: adesão {adherencePercent()}% — faltam {missedCountForToday()} tomas.</p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg p-4 shadow">
          <h3 className="text-xl font-normal mb-2">Próximas tomas</h3>
          <ul className="space-y-3">
            {meds
              .flatMap((m) => m.times.map((t) => ({ ...m, nextTime: t })))
              .sort((a, b) => a.nextTime.localeCompare(b.nextTime))
              .slice(0, 6)
              .map((m) => {
                const key = `${new Date().toLocaleDateString()} ${m.nextTime}`;
                const isTaken = !!m.taken[key];
                return (
                  <li key={m.id + m.nextTime} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{m.name} <span className="text-sm text-gray-500">{m.dose}</span></div>
                      <div className="text-xs text-gray-400">{m.nextTime}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-sm ${isTaken ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {isTaken ? 'Tomado' : 'Pendente'}
                      </div>
                      {!isTaken && (
                        <button
                          onClick={() => confirmTake(m.id, m.nextTime)}
                          className="px-3 py-1 bg-teal-500 text-white rounded hover:cursor-pointer hover:bg-teal-600 transition-colors duration-300 ease-in-out"
                        >
                          Confirmar
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-medium mb-2">Relatório rápido</h3>
          <div className="text-3xl font-bold">{adherencePercent()}%</div>
          <p className="text-sm text-gray-500">Adesão hoje</p>

          <div className="mt-4">
            <button onClick={() => setScreen('report')} className="w-full px-3 py-2 bg-indigo-600 text-white rounded hover:cursor-pointer hover:bg-indigo-700 transition-colors duration-300 ease-in-out">Ver histórico</button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">Conselhos rápidos</h3>
        <ul className="list-disc list-inside text-gray-600">
          <li>Associe a toma a uma rotina (ex.: café da manhã).</li>
          <li>Peça à farmácia para preparar as saquetas semanais.</li>
          <li>Active notificações no smartwatch para lembretes táteis.</li>
        </ul>
      </div>
    </div>
  );

  const Meds = () => (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Medicamentos</h2>
      <div className="space-y-4">
        {meds.map((m) => (
          <div key={m.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-sm text-gray-500">{m.dose} • {m.times.join(' · ')}</div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { setSelectedMed(m); setScreen('medDetail'); }} className="px-3 py-1 border rounded hover:cursor-pointer">Detalhes</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button onClick={() => setScreen('addMed')} className="px-4 py-2 bg-teal-500 text-white rounded hover:cursor-pointer hover:bg-teal-600 transition-colors duration-300 ease-in-out ">Adicionar Medicamento</button>
      </div>
    </div>
  );

  const MedDetail = ({ med }) => {
    if (!med) return null;
    return (
      <div className="p-6">
        <button onClick={() => setScreen('meds')} className="text-sm text-indigo-600 mb-4">← Voltar</button>
        <h2 className="text-2xl font-semibold mb-2">{med.name}</h2>
        <p className="text-gray-600 mb-4">Dose: {med.dose}</p>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium mb-2">Horários</h3>
          <ul className="text-gray-700">
            {med.times.map((t) => (
              <li key={t} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>{t}</div>
                <button onClick={() => confirmTake(med.id, t)} className="px-3 py-1 bg-teal-500 text-white rounded">Confirmar que tomei</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const Report = () => {
    // Simple weekly mock
    const week = 7;
    const days = Array.from({ length: week }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (week - 1 - i));
      return { label: d.toLocaleDateString(), percent: 70 + i * 3 };
    });

    return (
      <div className="p-6">
        <button onClick={() => setScreen('home')} className="text-sm text-indigo-600 mb-4">← Voltar</button>
        <h2 className="text-2xl font-semibold mb-2">Relatório de adesão (últimos 7 dias)</h2>
        <div className="bg-white p-4 rounded shadow">
          <ul className="space-y-3">
            {days.map((d) => (
              <li key={d.label} className="flex items-center justify-between">
                <div className="text-sm text-gray-700">{d.label}</div>
                <div className="text-sm font-medium">{d.percent}%</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const AddMed = () => {
    const [name, setName] = useState("");
    const [dose, setDose] = useState("");
    const [times, setTimes] = useState("");

    function save() {
      const newMed = {
        id: Date.now(),
        name,
        dose,
        times: times.split(",").map((t) => t.trim()),
        taken: {},
      };
      setMeds((m) => [...m, newMed]);
      setScreen('meds');
    }

    return (
      <div className="p-6">
        <button onClick={() => setScreen('meds')} className="text-sm text-indigo-600 mb-4">← Voltar</button>
        <h2 className="text-2xl font-semibold mb-4">Adicionar medicamento</h2>
        <div className="bg-white p-4 rounded shadow space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do medicamento" className="w-full p-2 border rounded" />
          <input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="Dose (ex: 50 mg)" className="w-full p-2 border rounded" />
          <input value={times} onChange={(e) => setTimes(e.target.value)} placeholder="Horários (ex: 08:00, 20:00)" className="w-full p-2 border rounded" />
          <div className="flex gap-2">
            <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded">Guardar</button>
            <button onClick={() => setScreen('meds')} className="px-4 py-2 border rounded">Cancelar</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 p-4">
          <div className="bg-white p-4 rounded shadow mb-4">
            <div className="font-medium">Atalho</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <button onClick={() => setScreen('home')} className={`w-full text-left p-2 border-gray-100 border-y-2 hover:cursor-pointer hover:bg-gray-100 transition-colors duration-300 ease-in-out ${screen==='home'? 'font-semibold':''}`}>Início</button>
              </li>
              <li>
                <button onClick={() => setScreen('meds')} className={`w-full text-left p-2 border-gray-100 border-y-2 hover:cursor-pointer hover:bg-gray-100 transition-colors duration-300 ease-in-out ${screen==='meds'? 'font-semibold':''}`}>Medicamentos</button>
              </li>
              <li>
                <button onClick={() => setScreen('report')} className={`w-full text-left p-2 border-gray-100 border-y-2 hover:cursor-pointer hover:bg-gray-100 transition-colors duration-300 ease-in-out ${screen==='report'? 'font-semibold':''}`}>Relatórios</button>
              </li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <div className="font-medium">Cuidador</div>
            <div className="text-sm text-gray-500 mt-2">{caregiverView ? 'Vera (vê notificações)' : 'José (modo local)'}</div>
            <div className="mt-3">
              <button onClick={() => alert('Simulação: notificação enviada ao cuidador.')} className="w-full px-3 py-2 bg-indigo-600 text-white rounded hover:cursor-pointer hover:bg-indigo-700 transition-colors duration-300 ease-in-out">Enviar notificação de teste</button>
            </div>
          </div>
        </aside>

        <main className="md:col-span-3">
          <div className="bg-gradient-to-b from-teal-50 to-white p-2 rounded">
            {screen === 'home' && <Home />}
            {screen === 'meds' && <Meds />}
            {screen === 'medDetail' && <MedDetail med={selectedMed} />}
            {screen === 'report' && <Report />}
            {screen === 'addMed' && <AddMed />}
          </div>
        </main>
      </div>

      <footer className="max-w-6xl mx-auto p-4 text-center text-gray-500 text-sm">
        Protótipo interativo — Lembra-me • Tecnologia com alma
      </footer>
    </div>
  );
}
