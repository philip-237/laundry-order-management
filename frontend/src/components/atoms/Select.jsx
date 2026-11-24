export default function Select({ options, ...props }) {
  return (
    <select {...props}>
      {Object.entries(options).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select>
  );
}
