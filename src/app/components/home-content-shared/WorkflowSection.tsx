import React from 'react';

const WORKFLOW_STEPS = [
  { num: 1, title: 'Terima Order', desc: 'Notifikasi order masuk sesuai wilayah & keahlian' },
  { num: 2, title: 'Survey Lokasi', desc: 'Kunjungi lokasi pelanggan untuk cek kebutuhan' },
  { num: 3, title: 'Kirim Quotation', desc: 'Ajukan penawaran harga dan estimasi waktu' },
  { num: 4, title: 'Pelanggan Bayar', desc: 'Pembayaran quotation tercatat di sistem' },
  { num: 5, title: 'Pengerjaan', desc: 'Kerjakan sesuai jadwal yang disepakati' },
  { num: 6, title: 'Selesai & Rating', desc: 'Order ditutup, pelanggan memberi penilaian' },
];

export const WorkflowSection: React.FC = () => {
  return (
    <>
      <div className='sec-head'>
        <h2>Cara kerja vendor di Mitra10</h2>
        <p>Alur singkat setiap order, dari masuk sampai selesai.</p>
      </div>
      <div className='flow'>
        {WORKFLOW_STEPS.map((step) => (
          <div className='flow-step' key={step.num}>
            <div className='connector' />
            <div className='num'>{step.num}</div>
            <div className='ftitle'>{step.title}</div>
            <div className='fdesc'>{step.desc}</div>
          </div>
        ))}
      </div>
    </>
  );
};
