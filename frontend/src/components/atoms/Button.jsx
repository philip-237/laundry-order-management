export default function Button({ variant = 'primary', type = 'button', ...props }) {
  return <button className={`button button--${variant}`} type={type} {...props} />;
}
