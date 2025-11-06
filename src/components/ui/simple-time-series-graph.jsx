import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const SimpleTimeSeriesGraph = ({ data }) => {
  if (!data || data.length === 0 || data[0] === 'NO DATA') return;

  const firstItem = data[0] || {};

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const { name, value } = payload[0];

    return (
      <div
        style={{
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '5px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            color: '#003f5c',
            marginBottom: '8px',
          }}
        >
          {label}
        </div>
        <div style={{ color: '#333' }}>
          {name} : <strong>{value}</strong>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart
        data={data}
        margin={{ top: 50, right: 70, bottom: 20, left: 30 }}
      >
        <Legend
          verticalAlign="bottom"
          wrapperStyle={{
            paddingTop: 40,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
          }}
        />
        <Tooltip content={CustomTooltip} />
        <CartesianGrid strokeDasharray="3" vertical={false} />
        <XAxis
          dataKey="mdatetime"
          allowDuplicatedCategory={false}
          label={{
            value: '측정시간',
            position: 'bottom',
            fontWeight: 'bold',
          }}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          orientation="left"
          type="number"
          fontSize={12}
          allowDataOverflow={true}
          tickCount={10}
          domain={['auto', 'auto']}
          label={{
            value: firstItem.itemNm || '',
            angle: -90,
            position: 'insideLeft',
            fontWeight: 'bold',
          }}
        />
        <Line
          data={data}
          dataKey="conc"
          name={`${firstItem.itemNm || ''}`}
          stroke={'#003f5c'}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SimpleTimeSeriesGraph;
