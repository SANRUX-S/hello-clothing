export default function ProductLoading() {
  return (
    <div className="product-page page-gutter" style={{ opacity: 0.7, minHeight: '80vh' }}>
      <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#888', marginBottom: '24px' }}>
        <span>Home</span> / <span>Collection</span> / <span>...</span>
      </div>
      <div className="product-detail-grid">
        <div style={{ background: '#e5e3dc', aspectRatio: '4/5', width: '100%', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 0' }}>
          <div style={{ width: '100px', height: '12px', background: '#e0ded6', borderRadius: '2px' }} />
          <div style={{ width: '70%', height: '36px', background: '#d8d6cd', borderRadius: '2px' }} />
          <div style={{ width: '120px', height: '22px', background: '#dcdad1', borderRadius: '2px' }} />
          <div style={{ width: '100%', height: '80px', background: '#e5e3dc', borderRadius: '2px', marginTop: '12px' }} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            {['S', 'M', 'L', 'XL'].map((s) => (
              <div key={s} style={{ width: '48px', height: '40px', background: '#e5e3dc', borderRadius: '2px' }} />
            ))}
          </div>
          <div style={{ width: '100%', height: '48px', background: '#141614', opacity: 0.2, marginTop: '24px' }} />
        </div>
      </div>
    </div>
  );
}
