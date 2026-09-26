import { useState } from 'react';
import { sanitizeNumeric } from '../utils/numericInput';

export interface TukangItem {
  full_name: string;
  phone_number: string;
  ktp_number: string;
  service_type_id: number[];
}

export const useVendorRegistrationForm = () => {
  const [formData, setFormData] = useState<Record<string, any>>({
    company_name: '',
    address: '',
    phone_number: '',
    email_address: '',
    pic_name: '',
    pic_email: '',
    pic_phone: '',
    ktp_number: '',
    npwp_number: '',
    bank_id: null,
    service_types: [],
    areas: [],
    pdp_consent: false,
  });

  const [images, setImages] = useState<Record<string, any>>({
    ktp_image: null,
    npwp_image: null,
    vendor_image: null,
    compro_image: null,
    surat_permohonan_image: null,
    pks_image: null,
    siup_image: null,
  });

  const [tukangList, setTukangList] = useState<TukangItem[]>([
    { full_name: '', phone_number: '', ktp_number: '', service_type_id: [] },
  ]);

  const updateField = (field: string, value: any) => {
    let sanitized = value;
    if (typeof value === 'string') {
      if (['phone_number', 'pic_phone'].includes(field)) {
        sanitized = sanitizeNumeric(value);
      } else if (['ktp_number', 'npwp_number'].includes(field)) {
        sanitized = sanitizeNumeric(value, 16);
      }
    }
    setFormData((prev) => ({ ...prev, [field]: sanitized }));
  };

  const updateImage = (field: string, file: any) => {
    setImages((prev) => ({ ...prev, [field]: file }));
  };

  const addTukang = () => {
    setTukangList((prev) => [
      ...prev,
      { full_name: '', phone_number: '', ktp_number: '', service_type_id: [] },
    ]);
  };

  const removeTukang = (index: number) => {
    setTukangList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTukang = (index: number, field: keyof TukangItem, value: any) => {
    let sanitized = value;
    if (typeof value === 'string') {
      if (field === 'phone_number') {
        sanitized = sanitizeNumeric(value);
      } else if (field === 'ktp_number') {
        sanitized = sanitizeNumeric(value, 16);
      }
    }
    setTukangList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: sanitized };
      return updated;
    });
  };

  return {
    formData,
    images,
    tukangList,
    updateField,
    updateImage,
    addTukang,
    removeTukang,
    updateTukang,
  };
};
