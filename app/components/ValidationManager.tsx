'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Rule {
  Id: string;
  ValidationName: string;
  Active: boolean;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ValidationManager() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [instance, setInstance] = useState<string | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    const i = searchParams.get('instance');
    if (t && i) { setToken(t); setInstance(i); }
  }, [searchParams]);

  const handleLogin = () => {
    window.location.href = `${BACKEND}/oauth/login`;
  };

  const fetchRules = async () => {
    setLoading(true);
    const res = await fetch(
      `${BACKEND}/api/validation-rules?token=${token}&instance=${encodeURIComponent(instance!)}`
    );
    const data = await res.json();
    setRules(data);
    setLoading(false);
  };

  const toggleRule = async (ruleId: string, current: boolean) => {
    setMessage('Updating...');
    await fetch(`${BACKEND}/api/toggle-rule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, instance, ruleId, active: !current }),
    });
    setMessage('✅ Rule updated in Salesforce!');
    fetchRules();
  };

  const toggleAll = async (active: boolean) => {
    setMessage('Updating all rules...');
    await fetch(`${BACKEND}/api/toggle-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, instance, active }),
    });
    setMessage(`✅ All rules ${active ? 'enabled' : 'disabled'} in Salesforce!`);
    fetchRules();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-1">Salesforce Validation Rule Manager</h1>
        <p className="text-gray-500 mb-8">Manage Account validation rules directly from this app</p>

        {!token ? (
          <button onClick={handleLogin}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            🔐 Login with Salesforce
          </button>
        ) : (
          <div>
            <p className="text-green-600 font-semibold mb-4">✅ Connected to Salesforce</p>
            <div className="flex gap-3 mb-6 flex-wrap">
              <button onClick={fetchRules} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                🔄 Get Validation Rules
              </button>
              <button onClick={() => toggleAll(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                ✅ Enable All
              </button>
              <button onClick={() => toggleAll(false)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                ❌ Disable All
              </button>
            </div>

            {message && <p className="text-blue-600 mb-4 font-medium">{message}</p>}
            {loading && <p className="text-gray-400">Loading rules...</p>}

            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.Id} className="bg-white border rounded-lg p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{rule.ValidationName}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${rule.Active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {rule.Active ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                  </div>
                  <button onClick={() => toggleRule(rule.Id, rule.Active)}
                    className={`px-4 py-2 rounded text-white font-medium ${rule.Active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}>
                    {rule.Active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}