import type { StoreName } from "./database";

type Listener = () => void;

/**
 * Event bus berbasis `EventTarget` untuk memberi tahu pemanggil setiap kali
 * sebuah store berubah (put/delete/clear). Repository yang memancarkan
 * event ini tidak perlu tahu siapa yang mendengarkan — nantinya dipakai
 * hook React (mis. lewat `useSyncExternalStore`) supaya UI ikut ter-update
 * saat data berubah dari komponen lain, tanpa prop drilling.
 */
class DbEventBus {
  private target = new EventTarget();

  emit(store: StoreName): void {
    this.target.dispatchEvent(new Event(store));
  }

  /** Mendaftar listener untuk satu store, mengembalikan fungsi untuk berhenti mendengarkan. */
  subscribe(store: StoreName, listener: Listener): () => void {
    const handler = () => listener();
    this.target.addEventListener(store, handler);
    return () => this.target.removeEventListener(store, handler);
  }
}

export const dbEvents = new DbEventBus();
