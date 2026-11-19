// Attrappe (Ersatz) für Firebase Firestore: speichert alles nur im Browser-Speicher.
// Wird im Test statt der echten Firebase-Dateien ausgeliefert.
const store = { users: {}, shifts: {}, desks: {}, settings: {} };
const listeners = [];
const snapDoc = (col, id) => ({ id, exists: () => id in store[col], data: () => store[col][id] && { ...store[col][id] } });
const notify = () => listeners.forEach(l => l.ref.id
  ? l.cb(snapDoc(l.ref.col, l.ref.id))
  : l.cb({ docs: Object.keys(store[l.ref.col]).map(id => snapDoc(l.ref.col, id)) }));
export const getFirestore = () => ({});
export const doc = (_db, col, id) => ({ col, id });
export const collection = (_db, col) => ({ col });
export const setDoc = async (r, v) => { store[r.col][r.id] = { ...v }; notify(); };
export const onSnapshot = (ref, cb) => { listeners.push({ ref, cb }); setTimeout(notify, 0); return () => {}; };
const ops = () => { const q = []; return { q,
  set: (r, v) => q.push(() => { store[r.col][r.id] = { ...v }; }),
  delete: r => q.push(() => { delete store[r.col][r.id]; }) }; };
export const runTransaction = async (_db, fn) => { const o = ops(); o.get = async r => snapDoc(r.col, r.id);
  await fn(o); o.q.forEach(f => f()); notify(); };
export const writeBatch = () => { const o = ops(); o.commit = async () => { o.q.forEach(f => f()); notify(); }; return o; };
window.__store = store;
