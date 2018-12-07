export default function isClass(func) {
  return typeof func === 'function' && /^class/.test(Function.prototype.toString.call(func))
}
