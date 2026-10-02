import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SPWarningModal from './SPWarningModal';

// Mock matchMedia agar antd Modal tidak error di JSDOM
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('SPWarningModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getBaseVendorInfo = () => ({
    vendor_id: 1,
    vendor_name: 'PT Test Vendor',
    sp_level: 1,
    sp_status: 'SP1',
    total_point: 30,
    allocation_reduction: 25,
  });

  it('should render SP1 warning message correctly', () => {
    const vendorInfo = getBaseVendorInfo();
    render(
      <SPWarningModal
        visible={true}
        vendorInfo={vendorInfo}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Assert modal is rendered
    expect(screen.getByText('Peringatan Vendor SP1')).toBeInTheDocument();
    expect(screen.getByText(/Vendor memiliki SP1/i)).toBeInTheDocument();
    expect(screen.getByText(/25/i)).toBeInTheDocument(); // Allocation reduction
    expect(screen.getByRole('button', { name: /Ya, Alokasikan/i })).toBeInTheDocument();
  });

  it('should render SP2 warning message correctly', () => {
    const vendorInfo = { ...getBaseVendorInfo(), sp_level: 2, sp_status: 'SP2', total_point: 40, allocation_reduction: 50 };
    render(
      <SPWarningModal
        visible={true}
        vendorInfo={vendorInfo}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Peringatan Vendor SP2')).toBeInTheDocument();
    expect(screen.getByText(/Vendor memiliki SP2/i)).toBeInTheDocument();
    expect(screen.getByText(/50/i)).toBeInTheDocument();
  });

  it('should render SP3 warning message correctly', () => {
    const vendorInfo = { ...getBaseVendorInfo(), sp_level: 3, sp_status: 'SP3', total_point: 50, allocation_reduction: 100 };
    render(
      <SPWarningModal
        visible={true}
        vendorInfo={vendorInfo}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Peringatan Vendor SP3')).toBeInTheDocument();
    expect(screen.getByText(/TIDAK DAPAT menerima order!/i)).toBeInTheDocument();
    // Tombol alokasikan seharusnya tidak ada untuk SP3
    expect(screen.queryByRole('button', { name: /Ya, Alokasikan/i })).not.toBeInTheDocument();
    // Hanya ada tombol Tutup
    expect(screen.getByRole('button', { name: /Tutup/i })).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button clicked', () => {
    const vendorInfo = getBaseVendorInfo();
    render(
      <SPWarningModal
        visible={true}
        vendorInfo={vendorInfo}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /Ya, Alokasikan/i });
    fireEvent.click(confirmBtn);
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button clicked', () => {
    const vendorInfo = getBaseVendorInfo();
    render(
      <SPWarningModal
        visible={true}
        vendorInfo={vendorInfo}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /Batal/i });
    fireEvent.click(cancelBtn);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should not render when visible is false', () => {
    const vendorInfo = getBaseVendorInfo();
    render(
      <SPWarningModal
        visible={false}
        vendorInfo={vendorInfo}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Antd Modal in false state has display: none or isn't mounted fully,
    // but the text inside shouldn't be visible to the user
    const modalTitle = screen.queryByText('Peringatan Vendor SP1');
    expect(modalTitle).not.toBeVisible();
  });
});
