import React, { useEffect, useRef, useState } from 'react';
import { useLLMSettings, useCreateLLMSettings, useUpdateLLMSettings, useDeleteLLMSettings } from '../../../hooks/llm';
import { ApiError } from '../../../services/api/client';
import { useLLMSettingsStore } from '../../store/llm/llm.store';

type StatusNotification = { type: 'success' | 'error'; message: string } | null;

export const Settings: React.FC = () => {
  const { data, isLoading, isError, error } = useLLMSettings();

  const createMutation = useCreateLLMSettings();
  const updateMutation = useUpdateLLMSettings();
  const deleteMutation = useDeleteLLMSettings();

  const { modelName, apiKey, apiKeyMasked, setModelName, setApiKey, initializeFromServer, clear } = useLLMSettingsStore();

  const [notification, setNotification] = useState<StatusNotification>(null);
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);

  const initializedServerSignatureRef = useRef<string | null>(null);

  const serverSettings = data?.settings ?? null;
  const isSettingsNotConfigured = error instanceof ApiError && error.status === 404;
  const hasSettings = !!serverSettings;

  useEffect(() => {
    if (!serverSettings) {
      if (isSettingsNotConfigured) {
        initializedServerSignatureRef.current = 'NOT_CONFIGURED';
        clear();
        setIsEditingApiKey(false);
      }
      return;
    }

    const serverSignature = [
      serverSettings.id,
      serverSettings.updated_at,
      serverSettings.model,
      serverSettings.has_api_key ? '1' : '0',
    ].join('|');

    if (initializedServerSignatureRef.current === serverSignature) return;

    initializedServerSignatureRef.current = serverSignature;

    initializeFromServer({
      model: serverSettings.model ?? '',
      apiKeyMasked: serverSettings.has_api_key ? '••••••••••••••••' : '',
      baseUrl: serverSettings.base_url ?? '',
    });

    setIsEditingApiKey(false);
  }, [serverSettings, isSettingsNotConfigured, initializeFromServer, clear]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const isBusy = isSaving || isDeleting;

  const handleSave = async () => {
    setNotification(null);
    const trimmedModel = modelName.trim();
    const trimmedApiKey = apiKey.trim();

    if (!trimmedModel) {
      return setNotification({ type: 'error', message: 'Model Name is required.' });
    }

    try {
      if (hasSettings) {
        await updateMutation.mutateAsync({
          model: trimmedModel,
          ...(trimmedApiKey ? { api_key: trimmedApiKey } : {}),
        });
        setApiKey('');
        setIsEditingApiKey(false);
        setNotification({ type: 'success', message: 'Settings updated successfully.' });
        return;
      }

      if (!trimmedApiKey) {
        return setNotification({ type: 'error', message: 'API Key is required when initializing settings.' });
      }

      await createMutation.mutateAsync({ model: trimmedModel, api_key: trimmedApiKey });
      setApiKey('');
      setIsEditingApiKey(false);
      setNotification({ type: 'success', message: 'Settings saved successfully.' });
    } catch (saveError) {
      setNotification({
        type: 'error',
        message: saveError instanceof Error ? saveError.message : 'Failed to save settings. Please try again.',
      });
    }
  };

  const handleDelete = async () => {
    setNotification(null);
    try {
      await deleteMutation.mutateAsync();
      clear();
      initializedServerSignatureRef.current = 'NOT_CONFIGURED';
      setIsEditingApiKey(false);
      setNotification({ type: 'success', message: 'Configuration deleted.' });
    } catch (deleteError) {
      setNotification({
        type: 'error',
        message: deleteError instanceof Error ? deleteError.message : 'Failed to delete configuration.',
      });
    }
  };

  if (isLoading) {
    return <div style={{ minHeight: '100%', padding: '32px 40px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Montserrat', sans-serif", fontSize: '13px' }}>Loading settings...</div>;
  }

  if (isError && !isSettingsNotConfigured) {
    return (
      <div style={{ minHeight: '100%', padding: '32px 40px', color: '#ff6b6b', fontFamily: "'Montserrat', sans-serif", fontSize: '13px' }}>
        <div>Failed to load LLM settings.</div>
        {error instanceof Error && <div style={{ marginTop: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{error.message}</div>}
      </div>
    );
  }

  const apiKeyDisplayValue = hasSettings && !isEditingApiKey ? apiKeyMasked : apiKey;

  return (
    <div style={{ minHeight: '100%', padding: '32px 40px', color: '#ffffff', fontFamily: "'Montserrat', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        @keyframes toastFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .toast-enter { animation: toastFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
      
      {/* HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", margin: 0, fontSize: '24px', fontWeight: 600, letterSpacing: '-0.5px' }}>Settings</h1>
        <p style={{ margin: '5px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Configure your local execution model credentials.</p>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", margin: 0, fontSize: '18px', fontWeight: 600 }}>Model Configuration</h2>
          <p style={{ margin: '6px 0 20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Manage the LLM provider details for agent execution.</p>

          {isSettingsNotConfigured && (
            <div style={{ marginBottom: '20px', padding: '11px 14px', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', color: 'rgba(255,255,255,0.55)', fontSize: '12px', lineHeight: 1.4 }}>
              No LLM configuration exists yet. Enter your model and API key to create one.
            </div>
          )}

          {notification && (
            <div
              className="toast-enter"
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                background: notification.type === 'success' ? 'rgba(39,201,63,0.08)' : 'rgba(255,107,107,0.08)',
                border: notification.type === 'success' ? '1px solid rgba(39,201,63,0.25)' : '1px solid rgba(255,107,107,0.25)',
                color: notification.type === 'success' ? '#27c93f' : '#ff6b6b',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{notification.message}</span>
              <button
                type="button"
                onClick={() => setNotification(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'currentColor',
                  cursor: 'pointer',
                  padding: '2px',
                  lineHeight: 1,
                  fontSize: '16px',
                  opacity: 0.7,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
              >
                ×
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* MODEL NAME */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="modelName" style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>Model Name</label>
              <input id="modelName" type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="e.g. mistral/mistral-medium-2512" disabled={isBusy} style={{ width: '100%', padding: '10px 14px', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box', opacity: isBusy ? 0.5 : 1, fontFamily: "'Montserrat', sans-serif" }} />
            </div>

            {/* API KEY */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="apiKey" style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>API Key</label>
              <input id="apiKey" type="password" value={apiKeyDisplayValue} onChange={(e) => { setIsEditingApiKey(true); setApiKey(e.target.value); }} onFocus={() => { if (hasSettings && !isEditingApiKey) { setIsEditingApiKey(true); setApiKey(''); } }} placeholder={hasSettings ? 'Enter new API key to replace existing key' : 'sk-...'} disabled={isBusy} autoComplete="off" style={{ width: '100%', padding: '10px 14px', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box', opacity: isBusy ? 0.5 : 1, fontFamily: "'Montserrat', sans-serif" }} />
              {hasSettings && !isEditingApiKey && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>An API key is configured. Click the field to replace it.</div>
              )}
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
              <button type="button" onClick={handleSave} disabled={isBusy} style={{ backgroundColor: '#FFE600', color: '#121212', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: isBusy ? 'not-allowed' : 'pointer', opacity: isBusy ? 0.6 : 1, fontFamily: "'Montserrat', sans-serif" }}>
                {isSaving ? 'Saving...' : hasSettings ? 'Update Settings' : 'Save Settings'}
              </button>

              {hasSettings && (
                <button type="button" onClick={handleDelete} disabled={isBusy} style={{ background: 'transparent', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.2)', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 500, cursor: isBusy ? 'not-allowed' : 'pointer', opacity: isBusy ? 0.6 : 1, fontFamily: "'Montserrat', sans-serif" }}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;