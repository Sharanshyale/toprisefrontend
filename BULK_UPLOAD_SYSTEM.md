# Bulk Upload System with Progress Tracking

## Overview

The Bulk Upload System provides a comprehensive solution for handling bulk operations across the application with real-time progress tracking, error handling, and user feedback. It's designed to work with various types of operations including products, categories, dealers, users, and assignments.

## Features

### 📊 **Real-time Progress Tracking**
- **Overall Progress Bar**: Visual progress indicator for the entire operation
- **Individual Item Progress**: Progress tracking for each item being processed
- **Statistics Cards**: Real-time counts of total, completed, failed, and skipped items
- **Status Indicators**: Color-coded status badges for different states

### 🔄 **Status Management**
- **Pending**: Items waiting to be processed
- **Processing**: Items currently being processed with progress
- **Completed**: Successfully processed items
- **Failed**: Items that failed with error messages
- **Skipped**: Items that were skipped (e.g., duplicates)

### 🛠️ **Error Handling & Recovery**
- **Error Display**: Detailed error messages for failed items
- **Retry Functionality**: Ability to retry failed items
- **Partial Success**: Continue processing even if some items fail
- **Validation**: Pre-upload validation with detailed feedback

### 📋 **User Experience**
- **Modal Dialog**: Non-blocking progress dialog
- **Real-time Updates**: Live updates without page refresh
- **Action Buttons**: Download results, view details, retry failed items
- **Responsive Design**: Works on all screen sizes

## Components

### 1. BulkUploadProgress Component

The main progress tracking dialog component.

```typescript
import BulkUploadProgress from "@/components/ui/bulk-upload-progress";

<BulkUploadProgress
  isOpen={isOpen}
  onClose={onClose}
  title="Bulk Product Upload"
  description="Uploading 50 products..."
  actionType="products"
  items={items}
  totalItems={50}
  completedItems={30}
  failedItems={5}
  skippedItems={2}
  isProcessing={true}
  onRetry={handleRetry}
  onDownloadResults={handleDownload}
  onViewDetails={handleViewDetails}
/>
```

### 2. useBulkUpload Hook

Custom hook for managing bulk upload state and operations.

```typescript
import { useBulkUpload } from "@/hooks/useBulkUpload";

const [state, actions] = useBulkUpload();

// Start upload
actions.startUpload(items, title, description, actionType);

// Update item status
actions.updateItemStatus(itemId, "processing", undefined, 50);

// Complete upload
actions.completeUpload();
```

### 3. Progress Component

Reusable progress bar component.

```typescript
import { Progress } from "@/components/ui/progress";

<Progress value={75} className="h-3" />
```

## Usage Examples

### Basic Product Upload

```typescript
import { useBulkUpload } from "@/hooks/useBulkUpload";
import BulkUploadProgress from "@/components/ui/bulk-upload-progress";

function ProductUpload() {
  const [bulkState, bulkActions] = useBulkUpload();

  const handleBulkUpload = async (productNames: string[]) => {
    // Start the upload process
    bulkActions.startUpload(
      productNames,
      "Bulk Product Upload",
      `Uploading ${productNames.length} products...`,
      "products"
    );

    // Process each product
    for (let i = 0; i < productNames.length; i++) {
      const productName = productNames[i];
      const itemId = `item-${i}`;
      
      try {
        // Update to processing
        bulkActions.updateItemStatus(itemId, "processing", undefined, 0);
        
        // Simulate API call with progress
        const result = await uploadProduct(productName, (progress) => {
          bulkActions.updateItemStatus(itemId, "processing", undefined, progress);
        });
        
        // Mark as completed
        bulkActions.updateItemStatus(itemId, "completed");
      } catch (error) {
        // Mark as failed with error message
        bulkActions.updateItemStatus(itemId, "failed", error.message);
      }
    }
    
    // Complete the upload
    bulkActions.completeUpload();
  };

  return (
    <div>
      {/* Your upload form */}
      <button onClick={() => handleBulkUpload(["Product 1", "Product 2"])}>
        Upload Products
      </button>

      {/* Progress Dialog */}
      <BulkUploadProgress
        isOpen={bulkState.isOpen}
        onClose={bulkActions.closeUpload}
        title={bulkState.title}
        description={bulkState.description}
        actionType={bulkState.actionType}
        items={bulkState.items}
        totalItems={bulkState.totalItems}
        completedItems={bulkState.completedItems}
        failedItems={bulkState.failedItems}
        skippedItems={bulkState.skippedItems}
        isProcessing={bulkState.isProcessing}
        onRetry={bulkActions.retryFailed}
        onDownloadResults={bulkActions.downloadResults}
        onViewDetails={bulkActions.viewDetails}
      />
    </div>
  );
}
```

### Category Upload with Validation

```typescript
const handleCategoryUpload = async (categoryNames: string[]) => {
  // Validate categories first
  const validCategories = [];
  const invalidCategories = [];
  
  for (const name of categoryNames) {
    if (name.length > 0 && name.length <= 50) {
      validCategories.push(name);
    } else {
      invalidCategories.push(name);
    }
  }

  // Start upload with valid categories
  bulkActions.startUpload(
    validCategories,
    "Bulk Category Upload",
    `Uploading ${validCategories.length} categories...`,
    "categories"
  );

  // Process valid categories
  for (let i = 0; i < validCategories.length; i++) {
    const categoryName = validCategories[i];
    const itemId = `item-${i}`;
    
    try {
      bulkActions.updateItemStatus(itemId, "processing", undefined, 0);
      
      // API call to create category
      await createCategory(categoryName);
      
      bulkActions.updateItemStatus(itemId, "completed");
    } catch (error) {
      bulkActions.updateItemStatus(itemId, "failed", error.message);
    }
  }
  
  bulkActions.completeUpload();
};
```

### Dealer Assignment with Batch Processing

```typescript
const handleDealerAssignment = async (assignments: Array<{dealerId: string, products: string[]}>) => {
  bulkActions.startUpload(
    assignments.map(a => `Dealer ${a.dealerId}`),
    "Bulk Dealer Assignment",
    `Assigning ${assignments.length} dealers...`,
    "assignments"
  );

  for (let i = 0; i < assignments.length; i++) {
    const assignment = assignments[i];
    const itemId = `item-${i}`;
    
    try {
      bulkActions.updateItemStatus(itemId, "processing", undefined, 0);
      
      // Process assignment in batches
      const batchSize = 10;
      const products = assignment.products;
      
      for (let j = 0; j < products.length; j += batchSize) {
        const batch = products.slice(j, j + batchSize);
        await assignProductsToDealer(assignment.dealerId, batch);
        
        const progress = Math.min(((j + batchSize) / products.length) * 100, 100);
        bulkActions.updateItemStatus(itemId, "processing", undefined, progress);
      }
      
      bulkActions.updateItemStatus(itemId, "completed");
    } catch (error) {
      bulkActions.updateItemStatus(itemId, "failed", error.message);
    }
  }
  
  bulkActions.completeUpload();
};
```

## API Integration

### Upload Functions

```typescript
// Product upload with progress callback
const uploadProduct = async (productName: string, onProgress?: (progress: number) => void) => {
  const response = await fetch('/api/products/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: productName }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to upload product: ${response.statusText}`);
  }
  
  return response.json();
};

// Category creation
const createCategory = async (categoryName: string) => {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: categoryName }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create category: ${response.statusText}`);
  }
  
  return response.json();
};

// Dealer assignment
const assignProductsToDealer = async (dealerId: string, productIds: string[]) => {
  const response = await fetch(`/api/dealers/${dealerId}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productIds }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to assign products: ${response.statusText}`);
  }
  
  return response.json();
};
```

## Error Handling

### Common Error Scenarios

1. **Network Errors**: Connection timeouts, server errors
2. **Validation Errors**: Invalid data format, missing required fields
3. **Duplicate Errors**: Items that already exist
4. **Permission Errors**: Insufficient permissions for operation
5. **Resource Errors**: Server resource limitations

### Error Recovery Strategies

```typescript
const handleUploadWithRetry = async (items: string[], maxRetries = 3) => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemId = `item-${i}`;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        bulkActions.updateItemStatus(itemId, "processing", undefined, 0);
        await uploadItem(item);
        bulkActions.updateItemStatus(itemId, "completed");
        break;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          bulkActions.updateItemStatus(itemId, "failed", error.message);
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }
  }
};
```

## Performance Optimization

### Batch Processing

```typescript
const processBatch = async (items: string[], batchSize = 10) => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Process batch in parallel
    const promises = batch.map(async (item, index) => {
      const itemId = `item-${i + index}`;
      try {
        bulkActions.updateItemStatus(itemId, "processing", undefined, 0);
        await processItem(item);
        bulkActions.updateItemStatus(itemId, "completed");
      } catch (error) {
        bulkActions.updateItemStatus(itemId, "failed", error.message);
      }
    });
    
    await Promise.all(promises);
  }
};
```

### Memory Management

```typescript
// Clean up completed items to prevent memory issues
const cleanupCompletedItems = () => {
  setState(prev => ({
    ...prev,
    items: prev.items.filter(item => item.status === "processing" || item.status === "pending")
  }));
};
```

## Customization

### Custom Action Types

```typescript
// Add custom action type
const customActionType = "inventory" as const;

// Custom icon for inventory
const getCustomIcon = (actionType: string) => {
  if (actionType === "inventory") {
    return <Warehouse className="h-5 w-5" />;
  }
  return getActionIcon(actionType);
};

<BulkUploadProgress
  actionType={customActionType}
  customIcon={<Warehouse className="h-5 w-5" />}
  // ... other props
/>
```

### Custom Status Handling

```typescript
// Add custom status
const customStatus = "validating" as const;

// Custom status badge
const getCustomStatusBadge = (status: string) => {
  if (status === "validating") {
    return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Validating</Badge>;
  }
  return getStatusBadge(status);
};
```

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BulkUploadProgress from '@/components/ui/bulk-upload-progress';

test('shows progress correctly', () => {
  const items = [
    { id: '1', name: 'Product 1', status: 'completed' },
    { id: '2', name: 'Product 2', status: 'processing' },
  ];
  
  render(
    <BulkUploadProgress
      isOpen={true}
      items={items}
      totalItems={2}
      completedItems={1}
      failedItems={0}
      skippedItems={0}
      isProcessing={true}
      // ... other props
    />
  );
  
  expect(screen.getByText('50%')).toBeInTheDocument();
  expect(screen.getByText('Product 1')).toBeInTheDocument();
});
```

### Integration Tests

```typescript
test('handles bulk upload workflow', async () => {
  const { result } = renderHook(() => useBulkUpload());
  
  // Start upload
  act(() => {
    result.current[1].startUpload(['Item 1', 'Item 2'], 'Test Upload', 'Testing...', 'products');
  });
  
  expect(result.current[0].isOpen).toBe(true);
  expect(result.current[0].isProcessing).toBe(true);
  
  // Update item status
  act(() => {
    result.current[1].updateItemStatus('item-0', 'completed');
  });
  
  expect(result.current[0].completedItems).toBe(1);
});
```

## Best Practices

### 1. **User Feedback**
- Always show progress for long-running operations
- Provide clear error messages
- Allow users to retry failed operations

### 2. **Performance**
- Use batch processing for large datasets
- Implement proper error handling and retry logic
- Clean up completed items to prevent memory issues

### 3. **Accessibility**
- Provide keyboard navigation
- Include proper ARIA labels
- Ensure color contrast meets WCAG guidelines

### 4. **Error Handling**
- Implement graceful degradation
- Provide meaningful error messages
- Allow partial success scenarios

### 5. **Testing**
- Test with various data sizes
- Test error scenarios
- Test retry functionality

## Future Enhancements

### Planned Features
1. **WebSocket Integration**: Real-time progress updates
2. **Background Processing**: Continue processing when dialog is closed
3. **Advanced Filtering**: Filter items by status
4. **Export Functionality**: Export results to CSV/Excel
5. **Template Support**: Pre-defined upload templates

### API Enhancements
1. **Resumable Uploads**: Resume interrupted uploads
2. **Chunked Processing**: Process large datasets in chunks
3. **Priority Queuing**: Priority-based processing
4. **Rate Limiting**: Built-in rate limiting for API calls
