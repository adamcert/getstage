export interface ScannerTicket {
  /** The QR/token value stored in the DB `token` column */
  token: string;
  status: "issued" | "sent" | "checked_in" | "cancelled" | "void";
  firstName: string;
  lastName: string;
  tierName: string;
  eventId: string;
}

export interface QueueItem {
  id?: number; // Dexie auto-increment primary key
  token: string;
  scannedAt: string; // ISO-8601
  deviceId: string;
  retries: number;
}

export interface ScannerEvent {
  id: string;
  title: string;
  capacity: number;
  checkedIn: number;
  startsAt: string;
}
