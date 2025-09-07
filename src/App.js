import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

// Função para calcular Média Móvel Simples
const calculateSMA = (data, period) => {
  return data.map((_, idx, arr) => {
    if (idx < period) return null;
    const sum = arr.slice(idx - period, idx).reduce((a, b) => a + b, 0);
    return sum / period;
  });
};

// Função para calcular RSI
const calculateRSI = (data, period = 14) => {
  let gains = 0;
  let losses = 0;
  let rsi = [];

  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;

    if (i >= period) {
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgGain / (avgLoss || 1);
      rsi.push(100 - 100 / (1 + rs));
      const firstDiff = data[i - period + 1] - data[i - period];
      if (firstDiff >= 0) gains -= firstDiff;
      else losses += firstDiff;
    } else rsi.push(null);
  }
  return rsi;
};

const App = () => {
  const [prices, setPrices] = useState([]);
  const [signal, setSignal] = useState('Neutro');

  // Simulando dados de mercado
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const newPrice = prev.length
          ? prev[prev.length - 1] + (Math.random() - 0.5) * 0.002
          : 1.1200;
        const updated = [...prev, parseFloat(newPrice.toFixed(5))].slice(-50);

        const smaShort = calculateSMA(updated, 5);
        const smaLong = calculateSMA(updated, 20);
        const rsi = calculateRSI(updated);

        const lastIdx = updated.length - 1;
        if (smaShort[lastIdx] && smaLong[lastIdx]) {
          if (smaShort[lastIdx] > smaLong[lastIdx] && rsi[lastIdx] < 70)
            setSignal('CALL (Subida)');
          else if (smaShort[lastIdx] < smaLong[lastIdx] && rsi[lastIdx] > 30)
            setSignal('PUT (Queda)');
          else setSignal('Neutro');
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: prices.map((_, idx) => idx),
    datasets: [
      { label: 'Preço', data: prices, borderColor: 'blue', fill: false }
    ]
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Web App de Sinais Binários - Polarium Broker</h1>
      <h2>Último Sinal: {signal}</h2>
      <Line data={data} />
    </div>
  );
};

export default App;
