# Pickup Management

## Overview

The Pickup Management module is a specialized feature designed for Fulfillment-Staff users to manage pickup requests efficiently. It provides comprehensive tools to view pickup details, track status, and mark items as packed.

## Features

### 📦 **Pickup Request Management**
- **View All Pickups**: Complete list of pickup requests with filtering and search
- **Status Tracking**: Monitor pickup status from pending to completed
- **Priority Management**: Handle urgent, high, medium, and low priority pickups
- **Customer Information**: Access customer and dealer contact details

### 🔍 **Advanced Filtering & Search**
- **Search Functionality**: Search by pickup ID, customer name, dealer name, or order ID
- **Status Filtering**: Filter by pickup status (pending, scheduled, in progress, packed, etc.)
- **Priority Filtering**: Filter by priority level (urgent, high, medium, low)
- **Clear Filters**: Reset all filters with one click

### 📋 **Detailed Pickup Information**
- **Customer Details**: Name, phone number, and pickup address
- **Dealer Information**: Dealer name, contact details
- **Item Details**: Product name, SKU, quantity, condition, and notes
- **Timestamps**: Creation, update, and scheduled dates
- **Assignment Tracking**: Staff member assigned to pickup

### ✅ **Packing Operations**
- **Mark as Packed**: Update pickup status to "packed"
- **Packing Notes**: Add optional notes during packing process
- **Status Updates**: Real-time status changes with confirmation
- **Progress Tracking**: Visual status indicators

## Technical Implementation

### File Structure
```
src/
├── components/user-dashboard/pickup-management/
│   └── PickupManagement.tsx          # Main pickup management component
├── service/
│   └── pickup-service.ts             # API service functions
└── app/(user)/user/dashboard/pickup/
    └── page.tsx                      # Pickup page route
```

### API Endpoints

#### Pickup Requests
- `GET /orders/api/pickup/requests` - Get all pickup requests
- `GET /orders/api/pickup/requests/{id}` - Get specific pickup request
- `POST /orders/api/pickup/requests` - Create new pickup request
- `PUT /orders/api/pickup/requests/{id}/status` - Update pickup status
- `PUT /orders/api/pickup/requests/{id}/assign` - Assign pickup to staff
- `PUT /orders/api/pickup/requests/{id}/cancel` - Cancel pickup request

#### Filtering & Search
- `GET /orders/api/pickup/requests?status={status}` - Filter by status
- `GET /orders/api/pickup/requests?priority={priority}` - Filter by priority
- `GET /orders/api/pickup/requests/search?q={term}` - Search pickup requests

#### Statistics & Bulk Operations
- `GET /orders/api/pickup/statistics` - Get pickup statistics
- `PUT /orders/api/pickup/requests/bulk-status` - Bulk status update
- `PUT /orders/api/pickup/requests/bulk-assign` - Bulk assignment

### Data Types

#### PickupRequest
```typescript
interface PickupRequest {
  _id: string;
  pickupId: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  dealerName: string;
  dealerPhone: string;
  pickupAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  scheduledDate: string;
  status: "pending" | "scheduled" | "in_progress" | "packed" | "picked_up" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  items: PickupItem[];
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### PickupItem
```typescript
interface PickupItem {
  _id: string;
  productName: string;
  sku: string;
  quantity: number;
  condition: "new" | "used" | "damaged";
  notes?: string;
}
```

## User Interface

### Dashboard Layout
1. **Header Section**
   - Page title and description
   - Refresh button for real-time updates

2. **Filters Section**
   - Search input with icon
   - Status dropdown filter
   - Priority dropdown filter
   - Clear filters button

3. **Pickup Table**
   - Comprehensive pickup information
   - Status badges with color coding
   - Priority indicators
   - Action buttons for each pickup

### Interactive Features
- **Real-time Updates**: Refresh button to fetch latest data
- **Status Management**: Color-coded status badges
- **Priority Indicators**: Visual priority management
- **Quick Actions**: View details and mark as packed
- **Responsive Design**: Optimized for all screen sizes

### Modal Dialogs
1. **Pickup Details Dialog**
   - Complete pickup information
   - Customer and dealer details
   - Item list with conditions
   - Address information
   - Timestamps and notes

2. **Mark as Packed Dialog**
   - Confirmation dialog
   - Optional packing notes
   - Status update confirmation

## Status Management

### Pickup Status Flow
1. **Pending** → Initial pickup request
2. **Scheduled** → Pickup scheduled with date/time
3. **In Progress** → Pickup being processed
4. **Packed** → Items packed and ready
5. **Picked Up** → Items collected by courier
6. **Completed** → Pickup successfully completed
7. **Cancelled** → Pickup cancelled

### Priority Levels
- **Urgent**: Red badge with alert icon
- **High**: Red badge with clock icon
- **Medium**: Yellow badge
- **Low**: Green badge with check icon

## Error Handling

### Fallback Strategy
- **API Failure**: Graceful fallback to mock data
- **Loading States**: Spinner and progress indicators
- **Error Messages**: User-friendly error notifications
- **Retry Mechanism**: Automatic retry on network issues

### Mock Data
When API endpoints are unavailable, the pickup management displays realistic mock data:
- Sample pickup requests with various statuses
- Customer and dealer information
- Product items with conditions
- Proper data formatting and validation

## Integration

### Role-Based Access
- **Fulfillment-Staff**: Full access to pickup management
- **Other Roles**: Redirected to appropriate sections
- **Authentication**: Protected routes with proper validation

### Navigation Integration
- **Sidebar**: Pickup tab visible for Fulfillment-Staff
- **Breadcrumbs**: Proper navigation hierarchy
- **Quick Access**: Direct navigation from fulfillment dashboard

## Performance Optimization

### Data Loading
- **Parallel API Calls**: Simultaneous data fetching
- **Caching**: Optional data caching for better performance
- **Lazy Loading**: Components load as needed

### UI Optimization
- **Virtual Scrolling**: For large datasets
- **Debounced Search**: Prevent excessive API calls
- **Optimistic Updates**: Immediate UI feedback

## Future Enhancements

### Planned Features
1. **Real-time Notifications**: WebSocket integration for live updates
2. **Advanced Filtering**: Date range and location filters
3. **Export Functionality**: CSV/PDF export of pickup data
4. **Bulk Operations**: Mass status updates and assignments
5. **Analytics Integration**: Pickup performance metrics

### API Enhancements
1. **WebSocket Support**: Real-time status updates
2. **Advanced Search**: Full-text search across all fields
3. **Data Export**: API endpoints for data export
4. **Mobile Optimization**: Responsive design improvements

## Testing

### Manual Testing Checklist
- [ ] Pickup management loads with correct data
- [ ] Search functionality works properly
- [ ] Status and priority filters function correctly
- [ ] Pickup details dialog displays all information
- [ ] Mark as packed functionality works
- [ ] Error states display properly
- [ ] Responsive design on different screen sizes
- [ ] Loading states show during data fetch
- [ ] Mock data displays when API fails

### Automated Testing
- Unit tests for component logic
- Integration tests for API calls
- E2E tests for user workflows
- Performance tests for data loading

## Deployment

### Environment Configuration
- **Development**: Mock data with API fallback
- **Staging**: Real API endpoints with test data
- **Production**: Full API integration with error handling

### Monitoring
- API response times
- Error rates and types
- User engagement metrics
- Performance bottlenecks

## Support

### Troubleshooting
1. **Pickup not loading**: Check API connectivity
2. **Search not working**: Verify search functionality
3. **Status not updating**: Confirm API integration
4. **Performance problems**: Monitor API response times

### Documentation
- API documentation for backend integration
- User guides for pickup management features
- Troubleshooting guides for common issues
- Performance optimization guidelines

## API Integration Guide

### Backend Requirements
The pickup management system expects the following backend endpoints:

#### Required Endpoints
1. **GET /orders/api/pickup/requests**
   - Returns list of pickup requests
   - Supports query parameters for filtering

2. **PUT /orders/api/pickup/requests/{id}/status**
   - Updates pickup status
   - Accepts status and optional notes

3. **GET /orders/api/pickup/requests/{id}**
   - Returns detailed pickup information

#### Response Format
```json
{
  "success": true,
  "message": "Pickup requests retrieved successfully",
  "data": [
    {
      "_id": "pickup_id",
      "pickupId": "PICKUP-001",
      "orderId": "ORD-001",
      "customerName": "John Doe",
      "customerPhone": "+91-9876543210",
      "dealerName": "Auto Parts Plus",
      "dealerPhone": "+91-9876543211",
      "pickupAddress": {
        "address": "123 Customer Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001"
      },
      "scheduledDate": "2025-01-20T10:00:00Z",
      "status": "scheduled",
      "priority": "high",
      "items": [
        {
          "_id": "item_id",
          "productName": "Brake Pads",
          "sku": "BP-001",
          "quantity": 2,
          "condition": "new",
          "notes": "Front brake pads"
        }
      ],
      "notes": "Customer prefers morning pickup",
      "assignedTo": "Staff Member 1",
      "createdAt": "2025-01-19T08:00:00Z",
      "updatedAt": "2025-01-19T08:00:00Z"
    }
  ]
}
```

### Error Handling
The system gracefully handles API failures by:
1. Attempting real API calls first
2. Falling back to mock data if API fails
3. Displaying user-friendly error messages
4. Providing retry mechanisms
