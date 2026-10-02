import {
  normalizeStore,
  normalizeVendor,
  getStoreDisplayName,
  getVendorDisplayName,
  normalizeLiveChatRoom,
} from './roomDisplay';

describe('roomDisplay utilities', () => {
  // ── normalizeStore ────────────────────────────────────

  describe('normalizeStore', () => {
    it('should normalize store with store_name', () => {
      const result = normalizeStore({ id: 1, store_name: 'Toko A' });
      expect(result).toEqual({ id: '1', store_name: 'Toko A' });
    });

    it('should normalize store with storeName (camelCase)', () => {
      const result = normalizeStore({ id: '2', storeName: 'Toko B' });
      expect(result).toEqual({ id: '2', store_name: 'Toko B' });
    });

    it('should normalize store with only name field', () => {
      const result = normalizeStore({ id: 3, name: 'Toko C' });
      expect(result).toEqual({ id: '3', store_name: 'Toko C' });
    });

    it('should fallback to "Store {id}" when name is missing', () => {
      const result = normalizeStore({ id: 99 });
      expect(result).toEqual({ id: '99', store_name: 'Store 99' });
    });

    it('should prefer store_name over name', () => {
      const result = normalizeStore({ id: 1, store_name: 'Toko X', name: 'Wrong' });
      expect(result?.store_name).toBe('Toko X');
    });

    it('should return null for null/undefined input', () => {
      expect(normalizeStore(null)).toBeNull();
      expect(normalizeStore(undefined)).toBeNull();
    });

    it('should return null when id is missing', () => {
      expect(normalizeStore({ store_name: 'No ID' })).toBeNull();
    });

    it('should handle store_id as id source', () => {
      const result = normalizeStore({ store_id: '5', store_name: 'Toko 5' });
      expect(result?.id).toBe('5');
    });

    it('should handle nested store.id', () => {
      const result = normalizeStore({ store: { id: 7 }, store_name: 'Nested' });
      expect(result?.id).toBe('7');
    });
  });

  // ── normalizeVendor ─────────────────────────────────

  describe('normalizeVendor', () => {
    it('should normalize vendor with company_name', () => {
      const result = normalizeVendor({ id: 1, company_name: 'PT Vendor' });
      expect(result).toEqual({ id: '1', company_name: 'PT Vendor' });
    });

    it('should normalize vendor with name field', () => {
      const result = normalizeVendor({ id: '2', name: 'Vendor B' });
      expect(result).toEqual({ id: '2', company_name: 'Vendor B' });
    });

    it('should fallback to "Vendor {id}" when name is missing', () => {
      const result = normalizeVendor({ id: 99 });
      expect(result).toEqual({ id: '99', company_name: 'Vendor 99' });
    });

    it('should prefer company_name over name', () => {
      const result = normalizeVendor({ id: 1, company_name: 'PT A', name: 'Wrong' });
      expect(result?.company_name).toBe('PT A');
    });

    it('should return null for null/undefined input', () => {
      expect(normalizeVendor(null)).toBeNull();
      expect(normalizeVendor(undefined)).toBeNull();
    });

    it('should handle vendor_id as id source', () => {
      const result = normalizeVendor({ vendor_id: '5', company_name: 'V5' });
      expect(result?.id).toBe('5');
    });
  });

  // ── getStoreDisplayName ──────────────────────────────

  describe('getStoreDisplayName', () => {
    it('should return storeName when present', () => {
      const room = { storeName: 'Toko Utama' };
      expect(getStoreDisplayName(room)).toBe('Toko Utama');
    });

    it('should return store_name when storeName not present', () => {
      const room = { store_name: 'Toko Alt' };
      expect(getStoreDisplayName(room)).toBe('Toko Alt');
    });

    it('should fall back to "Store {storeId}" when no name fields', () => {
      const room = { storeId: 123 };
      expect(getStoreDisplayName(room)).toBe('Store 123');
    });

    it('should prefer store.store_name over store.name', () => {
      const room = { store: { store_name: 'Nested Store', name: 'Wrong' } };
      expect(getStoreDisplayName(room)).toBe('Nested Store');
    });

    it('should return null when no store data at all', () => {
      const room = {};
      expect(getStoreDisplayName(room)).toBeNull();
    });

    it('should handle nested store object', () => {
      const room = { store: { name: 'From Store Obj' } };
      expect(getStoreDisplayName(room)).toBe('From Store Obj');
    });
  });

  // ── getVendorDisplayName ──────────────────────────────

  describe('getVendorDisplayName', () => {
    it('should return vendorName when present', () => {
      const room = { vendorName: 'Vendor Utama' };
      expect(getVendorDisplayName(room)).toBe('Vendor Utama');
    });

    it('should return vendor_name when vendorName not present', () => {
      const room = { vendor_name: 'Vendor Alt' };
      expect(getVendorDisplayName(room)).toBe('Vendor Alt');
    });

    it('should fall back to "Vendor {vendorId}" when no name fields', () => {
      const room = { vendorId: 456 };
      expect(getVendorDisplayName(room)).toBe('Vendor 456');
    });

    it('should prefer vendor.company_name over vendor.name', () => {
      const room = { vendor: { company_name: 'PT Correct', name: 'Wrong' } };
      expect(getVendorDisplayName(room)).toBe('PT Correct');
    });

    it('should return null when no vendor data at all', () => {
      const room = {};
      expect(getVendorDisplayName(room)).toBeNull();
    });

    it('should handle nested vendor object with company_name', () => {
      const room = { vendor: { company_name: 'From Vendor Obj' } };
      expect(getVendorDisplayName(room)).toBe('From Vendor Obj');
    });
  });

  // ── normalizeLiveChatRoom ────────────────────────────

  describe('normalizeLiveChatRoom', () => {
    it('should preserve storeName when provided', () => {
      const room = { id: 1, storeName: 'My Store', storeId: '10' };
      const result = normalizeLiveChatRoom(room);
      expect(result.storeName).toBe('My Store');
    });

    it('should set type to ORDER when orderId is present', () => {
      const room = { id: 1, orderId: 'ORD-001' };
      const result = normalizeLiveChatRoom(room);
      expect(result.type).toBe('ORDER');
    });

    it('should set type to DIRECT_STORE when storeId without orderId', () => {
      const room = { id: 1, storeId: '5' };
      const result = normalizeLiveChatRoom(room);
      expect(result.type).toBe('DIRECT_STORE');
    });

    it('should use fallbackStoreName when provided', () => {
      const room = { id: 1, storeId: '5' };
      const result = normalizeLiveChatRoom(room, {
        fallbackStoreName: 'Fallback Store',
      });
      expect(result.storeName).toBe('Fallback Store');
    });

    it('should normalize nested store object', () => {
      const room = {
        id: 1,
        store: { id: '5', store_name: 'Nested Store' },
      };
      const result = normalizeLiveChatRoom(room);
      expect(result.store?.store_name).toBe('Nested Store');
    });

    it('should handle mixed id field formats', () => {
      const room1 = { id: 1 };
      const room2 = { room_id: 2 };
      expect(normalizeLiveChatRoom(room1).id).toBe(1);
      expect(normalizeLiveChatRoom(room2).id).toBe(2);
    });
  });
});
