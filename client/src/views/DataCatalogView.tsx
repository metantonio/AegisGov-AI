import React, { useState } from 'react';
import { Database, Plus, CheckCircle, Shield, Hash, Calendar, Tag } from 'lucide-react';
import { api } from '../services/api';

interface DataCatalogViewProps {
  sources: any[];
  onRefresh: () => void;
}

export const DataCatalogView: React.FC<DataCatalogViewProps> = ({ sources, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [owner, setOwner] = useState('');
  const [classification, setClassification] = useState('INTERNAL');
  const [permittedPurposes, setPermittedPurposes] = useState('customer_support, sales_analytics');
  const [qualityScore, setQualityScore] = useState(95);
  const [retentionDays, setRetentionDays] = useState(365);
  const [sampleContent, setSampleContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createSource({
        name,
        origin,
        owner,
        classification,
        permittedPurposes: permittedPurposes.split(',').map((s) => s.trim()),
        qualityScore: Number(qualityScore),
        retentionDays: Number(retentionDays),
        sampleContent
      });
      setShowModal(false);
      setName('');
      setOrigin('');
      setOwner('');
      setSampleContent('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to create data source');
    } finally {
      setLoading(false);
    }
  };

  const getClassificationBadge = (cls: string) => {
    switch (cls) {
      case 'PUBLIC': return 'badge-low';
      case 'INTERNAL': return 'badge-cyan';
      case 'CONFIDENTIAL': return 'badge-medium';
      case 'RESTRICTED': return 'badge-critical';
      default: return 'badge-low';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              Data & Sources Catalog (Stages 1 & 3)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ISO 42001 Cl. 6.1.2 & DAMA-DMBOK: Authoritative catalog tracking data origin, owner, quality, retention, and cryptographic hash lineage.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Register New Data Source
          </button>
        </div>
      </div>

      {/* Sources Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {sources.map((src) => (
          <div key={src.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className={`badge ${getClassificationBadge(src.classification)}`}>
                {src.classification}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                {src.id}
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
                {src.name}
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Origin: <b style={{ color: '#cbd5e1' }}>{src.origin}</b>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>Data Owner:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{src.owner}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>Quality Score:</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{src.qualityScore} / 100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>Retention SLA:</span>
                <span style={{ color: '#ffffff' }}>{src.retentionDays} Days</span>
              </div>
            </div>

            {/* Purposes */}
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: '4px' }}>
                Permitted Purposes (GDPR Art. 5):
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {src.permittedPurposes?.map((p: string) => (
                  <span key={p} style={{ fontSize: '0.68rem', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '4px' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Hash */}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              Lineage Hash: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{src.contentHash?.substring(0, 22)}...</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '500px', maxWidth: '90%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
              Register Authoritative Data Source
            </h3>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Source Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Corporate Travel Policy DB" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>System of Origin</label>
                <input required value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. Legal Doc Repository" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Assigned Owner</label>
                  <input required value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g. Chief Legal Officer" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Classification</label>
                  <select value={classification} onChange={(e) => setClassification(e.target.value)}>
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="INTERNAL">INTERNAL</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Permitted Purposes (comma separated)</label>
                <input value={permittedPurposes} onChange={(e) => setPermittedPurposes(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Register Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
