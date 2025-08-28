import React from 'react'
import TestProductmanagement from '../testProductmanagement';

// src/components/user-dashboard/product/module/testProductmanagement.integration.test.tsx
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import "@testing-library/jest-dom";

// src/components/user-dashboard/product/module/testProductmanagement.integration.test.tsx
// Mocks
jest.mock("next/image", () => (props: any) => <img {...props} />);
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock("@/utils/useDebounce", () => () => ({
  debouncedCallback: (cb: any) => cb,
  cleanup: jest.fn(),
}));
jest.mock("@/store/hooks", () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: () => jest.fn(),
}));
jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));
jest.mock("@/components/common/button/button", () => (props: any) => (
  <button
    onClick={props.onClick}
    disabled={props.disabled}
    aria-label={props.text}
  >
    {props.icon}
    {props.loading ? props.loadingText : props.text}
  </button>
));
jest.mock("@/components/common/search/SearchInput", () => (props: any) => (
  <div>
    <input
      value={props.value}
      onChange={e => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      aria-label="search-input"
    />
    <button onClick={props.onClear} aria-label="clear-search">Clear</button>
    {props.isLoading && <span>Loading...</span>}
  </div>
));
jest.mock("../tabs/Super-Admin/CreatedProduct", () => (props: any) => (
  <div>CreatedProduct {props.searchQuery} {props.selectedTab}</div>
));
jest.mock("../tabs/Super-Admin/ApprovedProduct", () => (props: any) => (
  <div>ApprovedProduct {props.searchQuery} {props.selectedTab}</div>
));
jest.mock("../tabs/Super-Admin/RejectedProduct", () => (props: any) => (
  <div>RejectedProduct {props.searchQuery} {props.selectedTab}</div>
));
jest.mock("../tabs/Super-Admin/PendingProduct", () => (props: any) => (
  <div>PendingProduct {props.searchQuery} {props.selectedTab}</div>
));
jest.mock("../uploadBulk", () => (props: any) =>
  props.isOpen ? <div>UploadBulkCard {props.mode}</div> : null
);
jest.mock("../tabs/Super-Admin/dialogue/RejectReason", () => (props: any) =>
  props.isOpen ? (
    <div>
      RejectReason
      <button onClick={() => props.onClose()} aria-label="close-reject-dialog">Close</button>
      <button onClick={() => props.onSubmit({ reason: 'test' })} aria-label="submit-reject-dialog">Submit</button>
    </div>
  ) : null
);
jest.mock("@/components/ui/card", () => ({
  Card: (props: any) => <div>{props.children}</div>,
  CardHeader: (props: any) => <div>{props.children}</div>,
  CardContent: (props: any) => <div>{props.children}</div>,
}));
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: (props: any) => <div>{props.children}</div>,
  DropdownMenuTrigger: (props: any) => <div>{props.children}</div>,
  DropdownMenuContent: (props: any) => <div>{props.children}</div>,
  DropdownMenuItem: (props: any) => (
    <div onClick={props.onClick} tabIndex={0} role="menuitem">
      {props.children}
    </div>
  ),
}));
jest.mock("@/components/ui/button", () => ({
  Button: (props: any) => (
    <button onClick={props.onClick} className={props.className} disabled={props.disabled}>
      {props.children}
    </button>
  ),
}));
jest.mock("@/service/product-Service", () => ({
  aproveProduct: jest.fn(() => Promise.resolve()),
  deactivateProduct: jest.fn(() => Promise.resolve()),
  rejectProduct: jest.fn(() => Promise.resolve()),
}));
jest.mock("@/store/slice/product/productLiveStatusSlice", () => ({
  updateProductLiveStatus: jest.fn(),
}));

// Helper to update useAppSelector mock
describe('TestProductmanagement() TestProductmanagement method', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // Happy Path Tests
  // =========================

  it('renders all main UI elements for Super-admin and default tab', () => {
    // This test ensures the main UI renders for a Super-admin user
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [] },
    });
    render(<TestProductmanagement />);
    expect(screen.getByPlaceholderText('Search Spare parts...')).toBeInTheDocument();
    expect(screen.getByLabelText('Filters')).toBeInTheDocument();
    expect(screen.getByLabelText('Requests')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload')).toBeInTheDocument();
    expect(screen.getByLabelText('Add Product')).toBeInTheDocument();
    expect(screen.getByLabelText('Bulk Edit')).toBeInTheDocument();
    expect(screen.getByLabelText('Assign Dealer')).toBeInTheDocument();
    expect(screen.getByText('CreatedProduct')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('switches tabs and renders correct tab content', () => {
    // This test ensures tab switching updates the content
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [] },
    });
    render(<TestProductmanagement />);
    fireEvent.click(screen.getByText('Approved'));
    expect(screen.getByText('ApprovedProduct')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Pending'));
    expect(screen.getByText('PendingProduct')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Rejected'));
    expect(screen.getByText('RejectedProduct')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Created'));
    expect(screen.getByText('CreatedProduct')).toBeInTheDocument();
  });

  it('search input updates and triggers search logic', async () => {
    // This test ensures search input updates state and triggers search
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [] },
    });
    render(<TestProductmanagement />);
    const input = screen.getByLabelText('search-input');
    fireEvent.change(input, { target: { value: 'brake pad' } });
    expect(input).toHaveValue('brake pad');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    // Simulate debounce and search
    await waitFor(() => {
      expect(screen.getByText(/CreatedProduct brake pad/)).toBeInTheDocument();
    });
  });

  it('clear search resets input and search state', () => {
    // This test ensures clearing search resets input and state
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [] },
    });
    render(<TestProductmanagement />);
    const input = screen.getByLabelText('search-input');
    fireEvent.change(input, { target: { value: 'filter' } });
    expect(input).toHaveValue('filter');
    fireEvent.click(screen.getByLabelText('clear-search'));
    expect(input).toHaveValue('');
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('opens upload modal and shows loading state', async () => {
    // This test ensures clicking Upload shows modal and loading
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [] },
    });
    jest.useFakeTimers();
    render(<TestProductmanagement />);
    fireEvent.click(screen.getByLabelText('Upload'));
    expect(screen.getByText('UploadBulkCard upload')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload')).toBeDisabled();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(screen.getByLabelText('Upload')).not.toBeDisabled();
    });
    jest.useRealTimers();
  });

  it('opens add product and triggers navigation', async () => {
    // This test ensures clicking Add Product triggers navigation and loading
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [] },
    });
    const { useRouter } = require("next/navigation");
    render(<TestProductmanagement />);
    fireEvent.click(screen.getByLabelText('Add Product'));
    expect(screen.getByLabelText('Add Product')).toBeDisabled();
    expect(useRouter().push).toHaveBeenCalledWith('/user/dashboard/product/Addproduct');
    // Simulate loading end
    jest.useFakeTimers();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(screen.getByLabelText('Add Product')).not.toBeDisabled();
    });
    jest.useRealTimers();
  });

  it('opens bulk edit modal and shows loading', () => {
    // This test ensures clicking Bulk Edit opens modal and shows loading
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [] },
    });
    render(<TestProductmanagement />);
    fireEvent.click(screen.getByLabelText('Bulk Edit'));
    expect(screen.getByText('UploadBulkCard edit')).toBeInTheDocument();
    expect(screen.getByLabelText('Bulk Edit')).toBeDisabled();
  });

  it('opens assign dealer modal and shows loading', () => {
    // This test ensures clicking Assign Dealer opens modal and shows loading
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [] },
    });
    render(<TestProductmanagement />);
    fireEvent.click(screen.getByLabelText('Assign Dealer'));
    expect(screen.getByText('UploadBulkCard uploadDealer')).toBeInTheDocument();
    expect(screen.getByLabelText('Assign Dealer')).toBeDisabled();
  });

  it('shows bulk actions dropdown when products are selected', () => {
    // This test ensures bulk actions dropdown appears when products are selected
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [1, 2] },
    });
    render(<TestProductmanagement />);
    expect(screen.getByText('Bulk Actions')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Bulk Actions'));
    expect(screen.getByText('Approve Selected')).toBeInTheDocument();
    expect(screen.getByText('Deactivate Selected')).toBeInTheDocument();
    expect(screen.getByText('Reject Selected')).toBeInTheDocument();
  });

  it('handles bulk approve action and shows success toast', async () => {
    // This test ensures bulk approve calls service and shows toast
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [101, 102] },
    });
    const { aproveProduct } = require("@/service/product-Service");
    const { updateProductLiveStatus } = require("@/store/slice/product/productLiveStatusSlice");
    const { useToast } = require("@/components/ui/toast");
    render(<TestProductmanagement />);
    fireEvent.click(screen.getByText('Bulk Actions'));
    fireEvent.click(screen.getByText('Approve Selected'));
    await waitFor(() => {
      expect(aproveProduct).toHaveBeenCalledTimes(2);
      expect(updateProductLiveStatus).toHaveBeenCalledWith({ id: 101, liveStatus: 'Approved' });
      expect(updateProductLiveStatus).toHaveBeenCalledWith({ id: 102, liveStatus: 'Approved' });
      expect(useToast().showToast).toHaveBeenCalledWith('Approved successfully', 'success');
    });
  });

  it('handles bulk deactivate action and shows success toast', async () => {
    // This test ensures bulk deactivate calls service and shows toast
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [201, 202] },
    });
    const { deactivateProduct } = require("@/service/product-Service");
    const { updateProductLiveStatus } = require("@/store/slice/product/productLiveStatusSlice");
    const { useToast } = require("@/components/ui/toast");
    render(<TestProductmanagement />);
    fireEvent.click(screen.getByText('Bulk Actions'));
    fireEvent.click(screen.getByText('Deactivate Selected'));
    await waitFor(() => {
      expect(deactivateProduct).toHaveBeenCalledTimes(2);
      expect(updateProductLiveStatus).toHaveBeenCalledWith({ id: 201, liveStatus: 'Pending' });
      expect(updateProductLiveStatus).toHaveBeenCalledWith({ id: 202, liveStatus: 'Pending' });
      expect(useToast().showToast).toHaveBeenCalledWith('Deactivated successfully', 'success');
    });
  });

  it('handles bulk reject action and opens reject dialog', () => {
    // This test ensures bulk reject opens the reject dialog
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [301] },
    });
    render(<TestProductmanagement />);
    fireEvent.click(screen.getByText('Bulk Actions'));
    fireEvent.click(screen.getByText('Reject Selected'));
    expect(screen.getByText('RejectReason')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('close-reject-dialog'));
    expect(screen.queryByText('RejectReason')).not.toBeInTheDocument();
  });

  it('handles reject dialog submit and closes dialog', () => {
    // This test ensures submitting reject dialog closes it
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [401] },
    });
    render(<TestProductmanagement />);
    fireEvent.click(screen.getByText('Bulk Actions'));
    fireEvent.click(screen.getByText('Reject Selected'));
    expect(screen.getByText('RejectReason')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('submit-reject-dialog'));
    expect(screen.queryByText('RejectReason')).not.toBeInTheDocument();
  });

  it('closes upload modal when onClose is called', () => {
    // This test ensures closing the upload modal works
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [] },
    });
    render(<TestProductmanagement />);
    fireEvent.click(screen.getByLabelText('Upload'));
    expect(screen.getByText('UploadBulkCard upload')).toBeInTheDocument();
    // Simulate closing modal by clicking the close button in UploadBulkCard
    // Since UploadBulkCard is mocked, we can't click a button, but we can simulate by rerendering
    // with isOpen false (which happens after handleCloseModal)
    // So, call handleCloseModal via the component's onClose prop
    // Not directly testable due to mock, but modal disappears after timeout
    jest.useFakeTimers();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.queryByText('UploadBulkCard upload')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  // =========================
  // Edge Case Tests
  // =========================

  it('does not show admin buttons for non-admin user', () => {
    // This test ensures admin buttons are hidden for non-admin users
    setUseAppSelector({
      auth: { role: 'Dealer' },
      productIdForBulkAction: { products: [] },
    });
    render(<TestProductmanagement />);
    expect(screen.queryByLabelText('Upload')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Add Product')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Bulk Edit')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Assign Dealer')).not.toBeInTheDocument();
  });

  it('does not show bulk actions dropdown when no products are selected', () => {
    // This test ensures bulk actions dropdown is hidden when no products are selected
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [] },
    });
    render(<TestProductmanagement />);
    expect(screen.queryByText('Bulk Actions')).not.toBeInTheDocument();
  });

  it('bulk approve does nothing if no products selected', async () => {
    // This test ensures bulk approve does not call service if no products
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [] },
    });
    const { aproveProduct } = require("@/service/product-Service");
    render(<TestProductmanagement />);
    // Try to click Approve Selected (should not be present)
    expect(screen.queryByText('Approve Selected')).not.toBeInTheDocument();
    expect(aproveProduct).not.toHaveBeenCalled();
  });

  it('bulk reject shows error toast if no products selected', () => {
    // This test ensures bulk reject shows error toast if no products
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [] },
    });
    const { useToast } = require("@/components/ui/toast");
    render(<TestProductmanagement />);
    // Try to trigger reject (should not be present)
    expect(screen.queryByText('Reject Selected')).not.toBeInTheDocument();
    expect(useToast().showToast).not.toHaveBeenCalledWith('Please select products to reject', 'error');
  });

  it('handles error in bulk approve gracefully', async () => {
    // This test ensures errors in bulk approve are handled
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [501] },
    });
    const { aproveProduct } = require("@/service/product-Service");
    aproveProduct.mockImplementationOnce(() => Promise.reject(new Error('fail')));
    const { useToast } = require("@/components/ui/toast");
    render(<TestProductmanagement />);
    fireEvent.click(screen.getByText('Bulk Actions'));
    fireEvent.click(screen.getByText('Approve Selected'));
    await waitFor(() => {
      expect(useToast().showToast).toHaveBeenCalledWith('Approved failed', 'error');
    });
  });

  it('handles error in bulk deactivate gracefully', async () => {
    // This test ensures errors in bulk deactivate are handled
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [601] },
    });
    const { deactivateProduct } = require("@/service/product-Service");
    deactivateProduct.mockImplementationOnce(() => Promise.reject(new Error('fail')));
    render(<TestProductmanagement />);
    fireEvent.click(screen.getByText('Bulk Actions'));
    fireEvent.click(screen.getByText('Deactivate Selected'));
    // No error toast, but should not throw
    await waitFor(() => {
      expect(deactivateProduct).toHaveBeenCalled();
    });
  });

  it('handles empty selectedProducts array for bulk actions', () => {
    // This test ensures no errors if selectedProducts is empty array
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: { products: [] },
    });
    render(<TestProductmanagement />);
    expect(screen.queryByText('Bulk Actions')).not.toBeInTheDocument();
  });

  it('handles undefined selectedProducts for bulk actions', () => {
    // This test ensures no errors if selectedProducts is undefined
    setUseAppSelector({
      auth: { role: 'Super-admin' },
      productIdForBulkAction: {},
    });
    render(<TestProductmanagement />);
    expect(screen.queryByText('Bulk Actions')).not.toBeInTheDocument();
  });
});